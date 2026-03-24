"""
SkillStore — PostgreSQL-backed agent Skill storage with semantic search.

A Skill is a reusable reasoning pattern extracted from sessions.
Skills are injected into agent context before think() to improve consistency.

Lifecycle:
  1. Created (manually or by EvolutorAgent) with approved_at=NULL
  2. Human approves → approved_at set, skill becomes active
  3. Used by MemoryManager.recall() → usage_count incremented
  4. Positive signal (vote, feedback) → success_count incremented

Schema: agent_skills (see migrations/004_skills.sql)
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

import asyncpg


@dataclass
class Skill:
    id: str
    name: str
    description: str
    domain: str
    template: str
    examples: list[dict]
    embedding: list[float] | None
    agent_scope: list[str] | None          # None = shared across all agents
    source_session_ids: list[str]
    created_by_agent_id: str
    usage_count: int
    success_count: int
    version: int
    parent_skill_id: str | None
    approved_at: datetime | None
    approved_by: str | None
    created_at: datetime
    updated_at: datetime

    @property
    def success_rate(self) -> float:
        return self.success_count / max(self.usage_count, 1)

    @property
    def is_approved(self) -> bool:
        return self.approved_at is not None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "domain": self.domain,
            "template": self.template,
            "examples": self.examples,
            "agent_scope": self.agent_scope,
            "source_session_ids": self.source_session_ids,
            "created_by_agent_id": self.created_by_agent_id,
            "usage_count": self.usage_count,
            "success_count": self.success_count,
            "success_rate": round(self.success_rate, 3),
            "version": self.version,
            "parent_skill_id": self.parent_skill_id,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "approved_by": self.approved_by,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    def to_context_fragment(self) -> str:
        """Format this skill as a prompt fragment to inject before think()."""
        lines = [f"[Skill: {self.name}]", self.template]
        if self.examples:
            ex = self.examples[0]
            lines.append(f"Example — Input: {ex.get('input', '')} → Output: {ex.get('output', '')}")
        return "\n".join(lines)


@dataclass
class SkillResult:
    """Returned by semantic search."""
    skill: Skill
    similarity: float


def _row_to_skill(row: asyncpg.Record) -> Skill:
    return Skill(
        id=row["id"],
        name=row["name"],
        description=row["description"],
        domain=row["domain"],
        template=row["template"],
        examples=list(row["examples"] or []),
        embedding=None,   # not returned in normal queries for perf
        agent_scope=list(row["agent_scope"]) if row["agent_scope"] else None,
        source_session_ids=list(row["source_session_ids"] or []),
        created_by_agent_id=row["created_by_agent_id"] or "human",
        usage_count=row["usage_count"],
        success_count=row["success_count"],
        version=row["version"],
        parent_skill_id=row["parent_skill_id"],
        approved_at=row["approved_at"],
        approved_by=row["approved_by"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


class SkillStore:
    """
    PostgreSQL-backed store for agent Skills.
    Thread-safe — uses asyncpg connection pool.

    Requires pgvector extension and migration 004_skills.sql.
    """

    def __init__(self, pool: asyncpg.Pool):
        self._pool = pool

    # ── Creation ──────────────────────────────────────────────────────────────

    async def create(
        self,
        name: str,
        description: str,
        domain: str,
        template: str,
        examples: list[dict] | None = None,
        agent_scope: list[str] | None = None,
        source_session_ids: list[str] | None = None,
        created_by_agent_id: str = "human",
        embedding: list[float] | None = None,
        parent_skill_id: str | None = None,
    ) -> Skill:
        """Create a new skill (pending approval)."""
        skill_id = str(uuid.uuid4())
        import json

        embedding_str = None
        if embedding:
            embedding_str = f"[{','.join(str(v) for v in embedding)}]"

        async with self._pool.acquire() as conn:
            if embedding_str:
                row = await conn.fetchrow(
                    """
                    INSERT INTO agent_skills
                        (id, name, description, domain, template, examples,
                         embedding, agent_scope, source_session_ids,
                         created_by_agent_id, parent_skill_id)
                    VALUES ($1,$2,$3,$4,$5,$6,$7::vector,$8,$9,$10,$11)
                    RETURNING *
                    """,
                    skill_id, name, description, domain, template,
                    json.dumps(examples or []),
                    embedding_str,
                    agent_scope, source_session_ids or [],
                    created_by_agent_id, parent_skill_id,
                )
            else:
                row = await conn.fetchrow(
                    """
                    INSERT INTO agent_skills
                        (id, name, description, domain, template, examples,
                         agent_scope, source_session_ids, created_by_agent_id,
                         parent_skill_id)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                    RETURNING *
                    """,
                    skill_id, name, description, domain, template,
                    json.dumps(examples or []),
                    agent_scope, source_session_ids or [],
                    created_by_agent_id, parent_skill_id,
                )

        return _row_to_skill(row)

    # ── Approval ──────────────────────────────────────────────────────────────

    async def approve(self, skill_id: str, approved_by: str = "human") -> Optional[Skill]:
        """Mark a skill as approved (sets approved_at = now)."""
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                UPDATE agent_skills
                SET approved_at = now(), approved_by = $2, updated_at = now()
                WHERE id = $1
                RETURNING *
                """,
                skill_id, approved_by,
            )
        return _row_to_skill(row) if row else None

    # ── Retrieval ─────────────────────────────────────────────────────────────

    async def get_by_id(self, skill_id: str) -> Optional[Skill]:
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM agent_skills WHERE id = $1", skill_id
            )
        return _row_to_skill(row) if row else None

    async def list_all(
        self,
        domain: str | None = None,
        agent_id: str | None = None,
        approved_only: bool = False,
        limit: int = 50,
    ) -> list[Skill]:
        """List skills with optional filters."""
        clauses = []
        params: list = []

        if domain:
            params.append(domain)
            clauses.append(f"domain = ${len(params)}")
        if agent_id:
            params.append([agent_id])
            clauses.append(f"(agent_scope IS NULL OR agent_scope && ${len(params)})")
        if approved_only:
            clauses.append("approved_at IS NOT NULL")

        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        params.append(limit)

        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                f"SELECT * FROM agent_skills {where} ORDER BY created_at DESC LIMIT ${len(params)}",
                *params,
            )
        return [_row_to_skill(r) for r in rows]

    async def search(
        self,
        query_embedding: list[float],
        agent_id: str | None = None,
        limit: int = 3,
        min_similarity: float = 0.5,
    ) -> list[SkillResult]:
        """
        Semantic search using pgvector cosine similarity.
        Only returns approved skills.

        Args:
            query_embedding: 1536-dim embedding of the current query
            agent_id: if set, filters to skills visible to this agent
            limit: max skills to return
            min_similarity: cosine similarity threshold (0-1)
        """
        embedding_str = f"[{','.join(str(v) for v in query_embedding)}]"

        clauses = ["approved_at IS NOT NULL", "embedding IS NOT NULL"]
        params: list = [embedding_str]

        if agent_id:
            params.append([agent_id])
            clauses.append(f"(agent_scope IS NULL OR agent_scope && ${len(params)})")

        where = "WHERE " + " AND ".join(clauses)
        params.append(min_similarity)
        params.append(limit)

        query = f"""
            SELECT *,
                   1 - (embedding <=> $1::vector) AS similarity
            FROM agent_skills
            {where}
            AND 1 - (embedding <=> $1::vector) >= ${len(params) - 1}
            ORDER BY embedding <=> $1::vector
            LIMIT ${len(params)}
        """

        async with self._pool.acquire() as conn:
            rows = await conn.fetch(query, *params)

        return [
            SkillResult(skill=_row_to_skill(r), similarity=float(r["similarity"]))
            for r in rows
        ]

    # ── Usage tracking ────────────────────────────────────────────────────────

    async def increment_usage(self, skill_id: str) -> None:
        """Call after injecting a skill into an agent's context."""
        async with self._pool.acquire() as conn:
            await conn.execute(
                "UPDATE agent_skills SET usage_count = usage_count + 1, updated_at = now() WHERE id = $1",
                skill_id,
            )

    async def increment_success(self, skill_id: str) -> None:
        """Call when a session using this skill receives positive feedback."""
        async with self._pool.acquire() as conn:
            await conn.execute(
                "UPDATE agent_skills SET success_count = success_count + 1, updated_at = now() WHERE id = $1",
                skill_id,
            )

    # ── Deletion ──────────────────────────────────────────────────────────────

    async def delete(self, skill_id: str) -> bool:
        async with self._pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM agent_skills WHERE id = $1", skill_id
            )
        return result == "DELETE 1"
