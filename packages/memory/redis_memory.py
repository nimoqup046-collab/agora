"""
RedisWorkingMemory — Hot in-session context cache.

Stores the current session's recent messages in Redis with TTL.
Fast read/write — agents see their recent context instantly.

Key pattern : agora:session:{session_id}:context
Value       : JSON list (LIFO, capped at max_messages)
TTL         : configurable (default 24h)
"""

from __future__ import annotations

import json
from typing import Any

import redis.asyncio as aioredis


class RedisWorkingMemory:
    KEY_PREFIX = "agora:session"
    DEFAULT_TTL = 86400       # 24 hours
    DEFAULT_MAX_MESSAGES = 100

    def __init__(
        self,
        client: aioredis.Redis,
        ttl_seconds: int = DEFAULT_TTL,
        max_messages: int = DEFAULT_MAX_MESSAGES,
    ):
        self._redis = client
        self._ttl = ttl_seconds
        self._max = max_messages

    def _key(self, session_id: str) -> str:
        return f"{self.KEY_PREFIX}:{session_id}:context"

    async def push_message(self, session_id: str, message: dict[str, Any]) -> None:
        """
        Push a message to the front of the context list.
        Caps at max_messages and refreshes the TTL.
        """
        key = self._key(session_id)
        pipe = self._redis.pipeline()
        pipe.lpush(key, json.dumps(message, default=str))
        pipe.ltrim(key, 0, self._max - 1)
        pipe.expire(key, self._ttl)
        await pipe.execute()

    async def get_context(
        self, session_id: str, limit: int = 20
    ) -> list[dict[str, Any]]:
        """
        Return the most recent `limit` messages (newest first).
        Returns empty list if session not found.
        """
        key = self._key(session_id)
        raw = await self._redis.lrange(key, 0, limit - 1)
        result = []
        for item in raw:
            try:
                result.append(json.loads(item))
            except json.JSONDecodeError:
                pass
        return result

    async def invalidate(self, session_id: str) -> None:
        """Remove the working memory for a session."""
        await self._redis.delete(self._key(session_id))

    async def ping(self) -> bool:
        """Check if Redis is reachable."""
        try:
            return await self._redis.ping()
        except Exception:
            return False
