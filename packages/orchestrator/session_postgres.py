"""
PostgresSessionStore — PostgreSQL-backed session persistence.

Implements the same async interface as the in-memory SessionStore,
replacing it as the default when a DB pool is available.
Sessions and messages survive API restarts.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Optional

import asyncpg

from .session import Session, SessionMessage, SessionStatus


class PostgresSessionStore:
    """
    PostgreSQL-backed session store using asyncpg.
    Schema: sessions + session_messages (see migrations/001_sessions.sql).
    """

    def __init__(self, pool: asyncpg.Pool):
        self._pool = pool

    # ── Write operations ────────────────────────────────────────────────────

    async def create(
        self,
        title: str,
        task: str,
        participant_ids: list[str],
    ) -> Session:
        import uuid
        session = Session(
            id=str(uuid.uuid4()),
            title=title,
            task=task,
            status=SessionStatus.ACTIVE,
            participant_ids=participant_ids,
        )
        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO sessions (id, title, task, status, participant_ids, metadata, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8)
                """,
                session.id,
                session.title,
                session.task,
                session.status.value,
                json.dumps(session.participant_ids),
                json.dumps(session.metadata),
                session.created_at,
                session.updated_at,
            )
        return session

    async def add_message(
        self,
        session_id: str,
        agent_id: str,
        agent_name: str,
        content: str,
        metadata: Optional[dict] = None,
    ) -> SessionMessage:
        import uuid
        msg = SessionMessage(
            id=str(uuid.uuid4()),
            session_id=session_id,
            agent_id=agent_id,
            agent_name=agent_name,
            content=content,
            metadata=metadata or {},
        )
        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO session_messages (id, session_id, agent_id, agent_name, content, metadata, timestamp)
                VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
                """,
                msg.id,
                session_id,
                agent_id,
                agent_name,
                content,
                json.dumps(msg.metadata),
                msg.timestamp,
            )
            # Update session updated_at
            await conn.execute(
                "UPDATE sessions SET updated_at = now() WHERE id = $1",
                session_id,
            )
        return msg

    async def update_status(self, session_id: str, status: SessionStatus) -> bool:
        async with self._pool.acquire() as conn:
            result = await conn.execute(
                "UPDATE sessions SET status = $1, updated_at = now() WHERE id = $2",
                status.value,
                session_id,
            )
        return result != "UPDATE 0"

    async def delete(self, session_id: str) -> bool:
        async with self._pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM sessions WHERE id = $1",
                session_id,
            )
        return result != "DELETE 0"

    # ── Read operations ─────────────────────────────────────────────────────

    async def get(self, session_id: str) -> Optional[Session]:
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM sessions WHERE id = $1",
                session_id,
            )
            if not row:
                return None
            session = self._row_to_session(row)

            # Load messages
            msg_rows = await conn.fetch(
                "SELECT * FROM session_messages WHERE session_id = $1 ORDER BY timestamp ASC",
                session_id,
            )
            session.messages = [self._row_to_message(r) for r in msg_rows]
        return session

    async def list_all(self) -> list[Session]:
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM sessions ORDER BY updated_at DESC"
            )
        # list_all returns sessions without messages (for performance)
        return [self._row_to_session(row) for row in rows]

    # ── Helpers ──────────────────────────────────────────────────────────────

    def _row_to_session(self, row: asyncpg.Record) -> Session:
        participant_ids = json.loads(row["participant_ids"]) if isinstance(row["participant_ids"], str) else row["participant_ids"]
        metadata = json.loads(row["metadata"]) if isinstance(row["metadata"], str) else row["metadata"]
        return Session(
            id=row["id"],
            title=row["title"],
            task=row["task"],
            status=SessionStatus(row["status"]),
            participant_ids=participant_ids or [],
            metadata=metadata or {},
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            messages=[],
        )

    def _row_to_message(self, row: asyncpg.Record) -> SessionMessage:
        metadata = json.loads(row["metadata"]) if isinstance(row["metadata"], str) else row["metadata"]
        return SessionMessage(
            id=row["id"],
            agent_id=row["agent_id"],
            agent_name=row["agent_name"],
            content=row["content"],
            timestamp=row["timestamp"],
            metadata=metadata or {},
        )
