"""
SoulStore — PostgreSQL-backed agent SOUL version storage.

A SOUL is a versioned system prompt for an agent, produced by the Evolutor.
Each draft requires human approval before becoming active.
Schema: agent_souls (see migrations/003_souls.sql).
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

import asyncpg


@dataclass
class Soul:
    id: str
    agent_id: str
    version: int
    soul_content: str
    delta_summary: str
    trigger_session_ids: list[str]
    created_at: datetime
    approved_at: Optional[datetime]
    approved_by: Optional[str]

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "version": self.version,
            "soul_content": self.soul_content,
            "delta_summary": self.delta_summary,
            "trigger_session_ids": self.trigger_session_ids,
            "created_at": self.created_at.isoformat(),
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "approved_by": self.approved_by,
        }


def _row_to_soul(row: asyncpg.Record) -> Soul:
    return Soul(
        id=row["id"],
        agent_id=row["agent_id"],
        version=row["version"],
        soul_content=row["soul_content"],
        delta_summary=row["delta_summary"],
        trigger_session_ids=list(row["trigger_session_ids"] or []),
        created_at=row["created_at"],
        approved_at=row["approved_at"],
        approved_by=row["approved_by"],
    )


class SoulStore:
    """
    PostgreSQL-backed store for agent SOUL versions.
    Thread-safe — uses asyncpg connection pool.
    """

    def __init__(self, pool: asyncpg.Pool):
        self._pool = pool

    async def save_draft(
        self,
        agent_id: str,
        soul_content: str,
        delta_summary: str,
        trigger_session_ids: list[str],
    ) -> Soul:
        """Save a new SOUL draft (unapproved). Version = max existing + 1."""
        soul_id = str(uuid.uuid4())
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT COALESCE(MAX(version), 0) AS max_v FROM agent_souls WHERE agent_id = $1",
                agent_id,
            )
            next_version = (row["max_v"] or 0) + 1

            await conn.execute(
                """
                INSERT INTO agent_souls
                    (id, agent_id, version, soul_content, delta_summary, trigger_session_ids)
                VALUES ($1, $2, $3, $4, $5, $6)
                """,
                soul_id,
                agent_id,
                next_version,
                soul_content,
                delta_summary,
                trigger_session_ids,
            )

        return Soul(
            id=soul_id,
            agent_id=agent_id,
            version=next_version,
            soul_content=soul_content,
            delta_summary=delta_summary,
            trigger_session_ids=trigger_session_ids,
            created_at=datetime.utcnow(),
            approved_at=None,
            approved_by=None,
        )

    async def get_latest_approved(self, agent_id: str) -> Optional[Soul]:
        """Return the most recently approved SOUL for an agent, or None."""
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT * FROM agent_souls
                WHERE agent_id = $1 AND approved_at IS NOT NULL
                ORDER BY version DESC
                LIMIT 1
                """,
                agent_id,
            )
        return _row_to_soul(row) if row else None

    async def list_by_agent(self, agent_id: str, limit: int = 20) -> list[Soul]:
        """Return SOUL history for an agent, newest first."""
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT * FROM agent_souls
                WHERE agent_id = $1
                ORDER BY version DESC
                LIMIT $2
                """,
                agent_id,
                limit,
            )
        return [_row_to_soul(r) for r in rows]

    async def get_by_id(self, soul_id: str) -> Optional[Soul]:
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM agent_souls WHERE id = $1", soul_id
            )
        return _row_to_soul(row) if row else None

    async def approve(self, soul_id: str, approved_by: str = "human") -> Optional[Soul]:
        """Mark a SOUL as approved (sets approved_at = now)."""
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                UPDATE agent_souls
                SET approved_at = now(), approved_by = $2
                WHERE id = $1
                RETURNING *
                """,
                soul_id,
                approved_by,
            )
        return _row_to_soul(row) if row else None
