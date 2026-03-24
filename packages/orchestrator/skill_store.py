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
    avg_quality_score: float | None
    version: int
    parent_skill_id: str | None
    approved_at: datetime | None
    approved_by: str | None
    deprecated_at: datetime | None
    created_at: datetime
    updated_at: datetime

    @property
    def success_rate(self) -> float:
        return self.success_count / max(self.usage_count, 1)

    @property
    def is_approved(self) -> bool:
        return self.approved_at is not None

    @property
    def is_deprecated(self) -> bool:
        return self.deprecated_at is not None

    @property
    def is_active(self) -> bool:
        return self.is_approved and not self.is_deprecated

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
            "avg_quality_score": round(self.avg_quality_score, 3) if self.avg_quality_score is not None else None,
            "version": self.version,
            "parent_skill_id": self.parent_skill_id,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "approved_by": self.approved_by,
            "deprecated_at": self.deprecated_at.isoformat() if self.deprecated_at else None,
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
    row_dict = dict(row)
    return Skill(
        id=row_dict["id"],
        name=row_dict["name"],
        description=row_dict["description"],
        domain=row_dict["domain"],
        template=row_dict["template"],
        examples=list(row_dict["examples"] or []),
        embedding=None,   # not returned in normal queries for perf
        agent_scope=list(row_dict["agent_scope"]) if row_dict["agent_scope"] else None,
        source_session_ids=list(row_dict["source_session_ids"] or []),
        created_by_agent_id=row_dict["created_by_agent_id"] or "human",
        usage_count=row_dict["usage_count"],
        success_count=row_dict["success_count"],
        avg_quality_score=row_dict.get("avg_quality_score"),
        version=row_dict["version"],
        parent_skill_id=row_dict["parent_skill_id"],
        approved_at=row_dict["approved_at"],
        approved_by=row_dict["approved_by"],
        deprecated_at=row_dict.get("deprecated_at"),
        created_at=row_dict["created_at"],
        updated_at=row_dict["updated_at"],
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
        include_deprecated: bool = False,
        limit: int = 50,
    ) -> list[Skill]:
        """List skills with optional filters. Excludes deprecated by default."""
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
        if not include_deprecated:
            clauses.append("deprecated_at IS NULL")

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

        clauses = ["approved_at IS NOT NULL", "embedding IS NOT NULL", "deprecated_at IS NULL"]
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

    # ── Deprecation (Phase C) ─────────────────────────────────────────────────

    async def deprecate(self, skill_id: str) -> Optional[Skill]:
        """Mark a skill as deprecated (soft-delete). Excluded from search/inject."""
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                UPDATE agent_skills
                SET deprecated_at = now(), updated_at = now()
                WHERE id = $1 AND deprecated_at IS NULL
                RETURNING *
                """,
                skill_id,
            )
        return _row_to_skill(row) if row else None

    async def auto_retire_weak_skills(
        self,
        min_usage: int = 10,
        max_success_rate: float = 0.3,
    ) -> list[str]:
        """
        Retire skills that have been used enough times but consistently underperform.
        Condition: usage_count >= min_usage AND success_count/usage_count < max_success_rate.
        Returns list of deprecated skill IDs.
        """
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                UPDATE agent_skills
                SET deprecated_at = now(), updated_at = now()
                WHERE approved_at IS NOT NULL
                  AND deprecated_at IS NULL
                  AND usage_count >= $1
                  AND (success_count::float / GREATEST(usage_count, 1)) < $2
                RETURNING id
                """,
                min_usage, max_success_rate,
            )
        return [r["id"] for r in rows]

    async def get_by_name(self, name: str) -> Optional[Skill]:
        """Find the latest non-deprecated skill by name (for version chaining)."""
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT * FROM agent_skills
                WHERE name = $1 AND deprecated_at IS NULL
                ORDER BY version DESC
                LIMIT 1
                """,
                name,
            )
        return _row_to_skill(row) if row else None

    # ── Deletion ──────────────────────────────────────────────────────────────

    async def delete(self, skill_id: str) -> bool:
        async with self._pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM agent_skills WHERE id = $1", skill_id
            )
        return result == "DELETE 1"

    # ── Usage audit log (Migration 005) ───────────────────────────────────────

    async def log_usage(
        self,
        skill_id: str,
        session_id: str,
        agent_id: str,
        query_text: str,
        similarity_score: float,
    ) -> str:
        """
        Record a skill injection in the audit log.
        Returns the new log entry ID.
        Called fire-and-forget from council router after injecting skills.
        """
        log_id = str(uuid.uuid4())
        try:
            async with self._pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO skill_usage_log
                        (id, skill_id, session_id, agent_id, query_text, similarity_score)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    """,
                    log_id, skill_id, session_id, agent_id,
                    query_text[:500], similarity_score,
                )
        except Exception:
            pass   # log table may not exist yet (pre-migration); don't crash
        return log_id

    async def score_usage(self, log_id: str, quality: float) -> None:
        """Set retroactive outcome_quality for a usage log entry (0.0-1.0)."""
        try:
            async with self._pool.acquire() as conn:
                await conn.execute(
                    "UPDATE skill_usage_log SET outcome_quality = $2 WHERE id = $1",
                    log_id, max(0.0, min(1.0, quality)),
                )
        except Exception:
            pass

    async def get_unscored_usage(self, limit: int = 50) -> list[dict]:
        """
        Return recent unscored usage log entries for Evolutor scoring.
        Each entry includes enough context for quality evaluation.
        """
        try:
            async with self._pool.acquire() as conn:
                rows = await conn.fetch(
                    """
                    SELECT ul.id, ul.skill_id, ul.session_id, ul.agent_id,
                           ul.query_text, ul.similarity_score, ul.injected_at,
                           s.name AS skill_name, s.template AS skill_template
                    FROM skill_usage_log ul
                    JOIN agent_skills s ON s.id = ul.skill_id
                    WHERE ul.outcome_quality IS NULL
                    ORDER BY ul.injected_at DESC
                    LIMIT $1
                    """,
                    limit,
                )
            return [dict(r) for r in rows]
        except Exception:
            return []

    async def update_avg_quality(self, skill_id: str) -> None:
        """
        Recalculate and store avg_quality_score from all scored usage log entries.
        Also updates success_count based on threshold (score >= 0.6).
        """
        try:
            async with self._pool.acquire() as conn:
                row = await conn.fetchrow(
                    """
                    SELECT
                        COUNT(*) AS total,
                        AVG(outcome_quality) AS avg_q,
                        COUNT(*) FILTER (WHERE outcome_quality >= 0.6) AS successes
                    FROM skill_usage_log
                    WHERE skill_id = $1 AND outcome_quality IS NOT NULL
                    """,
                    skill_id,
                )
                if row and row["total"] > 0:
                    await conn.execute(
                        """
                        UPDATE agent_skills
                        SET usage_count       = $2,
                            success_count     = $3,
                            avg_quality_score = $4,
                            updated_at        = now()
                        WHERE id = $1
                        """,
                        skill_id,
                        int(row["total"]),
                        int(row["successes"]),
                        float(row["avg_q"]) if row["avg_q"] is not None else None,
                    )
        except Exception:
            pass
