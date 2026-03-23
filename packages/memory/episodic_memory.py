"""
EpisodicMemory — Warm cross-session semantic memory via pgvector.

Embeds agent messages using OpenAI text-embedding-3-small (1536 dims)
and stores them in PostgreSQL with an HNSW index for fast cosine search.

This gives agents the ability to recall relevant knowledge from past sessions
when starting a new session on a related topic.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Optional

import asyncpg
from openai import AsyncOpenAI


@dataclass
class MemoryResult:
    id: str
    session_id: str
    agent_id: str
    content: str
    memory_type: str
    importance: float
    similarity: float
    metadata: dict

    def to_context_snippet(self) -> str:
        return f"[session:{self.session_id[:8]}] {self.content}"


class EpisodicMemory:
    """
    Stores and retrieves agent memories using pgvector cosine similarity.
    Schema: memory_embeddings (see migrations/002_memory.sql).
    """

    EMBEDDING_MODEL = "text-embedding-3-small"  # 1536 dims
    EMBEDDING_DIMS = 1536

    def __init__(self, pool: asyncpg.Pool, openai_client: AsyncOpenAI):
        self._pool = pool
        self._openai = openai_client

    async def store(
        self,
        session_id: str,
        agent_id: str,
        content: str,
        memory_type: str = "episodic",
        importance: float = 0.5,
        metadata: Optional[dict] = None,
    ) -> str:
        """
        Embed content and store in memory_embeddings.
        Returns the new memory ID.
        """
        embedding = await self._embed(content)
        memory_id = str(uuid.uuid4())

        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO memory_embeddings
                    (id, session_id, agent_id, content, embedding, memory_type, importance, metadata)
                VALUES ($1, $2, $3, $4, $5::vector, $6, $7, $8::jsonb)
                """,
                memory_id,
                session_id,
                agent_id,
                content,
                str(embedding),   # asyncpg accepts vector as string '[f1,f2,...]'
                memory_type,
                importance,
                "{}",
            )
        return memory_id

    async def search(
        self,
        query: str,
        agent_id: Optional[str] = None,
        session_id_exclude: Optional[str] = None,
        limit: int = 5,
        min_importance: float = 0.3,
    ) -> list[MemoryResult]:
        """
        Find memories semantically similar to `query`.
        Optionally filter by agent_id and exclude the current session.
        """
        embedding = await self._embed(query)
        embedding_str = str(embedding)

        conditions = ["importance >= $2"]
        params: list = [embedding_str, min_importance]
        param_idx = 3

        if agent_id:
            conditions.append(f"agent_id = ${param_idx}")
            params.append(agent_id)
            param_idx += 1

        if session_id_exclude:
            conditions.append(f"session_id != ${param_idx}")
            params.append(session_id_exclude)
            param_idx += 1

        where_clause = " AND ".join(conditions)
        params.append(limit)

        sql = f"""
            SELECT
                id, session_id, agent_id, content, memory_type, importance,
                1 - (embedding <=> $1::vector) AS similarity,
                metadata
            FROM memory_embeddings
            WHERE {where_clause}
            ORDER BY embedding <=> $1::vector
            LIMIT ${param_idx}
        """

        async with self._pool.acquire() as conn:
            rows = await conn.fetch(sql, *params)

        return [
            MemoryResult(
                id=row["id"],
                session_id=row["session_id"],
                agent_id=row["agent_id"],
                content=row["content"],
                memory_type=row["memory_type"],
                importance=float(row["importance"]),
                similarity=float(row["similarity"]),
                metadata=dict(row["metadata"]) if row["metadata"] else {},
            )
            for row in rows
        ]

    async def _embed(self, text: str) -> list[float]:
        """Get embedding vector for text."""
        # Truncate to ~8000 chars to avoid token limit issues
        text = text[:8000]
        resp = await self._openai.embeddings.create(
            input=text,
            model=self.EMBEDDING_MODEL,
        )
        return resp.data[0].embedding
