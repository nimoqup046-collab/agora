"""
MemoryManager — Unified facade over all memory tiers.

Orchestrates:
  - RedisWorkingMemory  (hot: current-session context, milliseconds)
  - EpisodicMemory      (warm: cross-session semantic recall, seconds)
  - SkillStore          (cool: reusable reasoning patterns, semantic search)

Usage in council router:
  1. Before agent.think_stream():  ctx = await memory.recall(...)
  2. After agent response saved:   asyncio.create_task(memory.on_message(...))
     (fire-and-forget — does not block the SSE stream)
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING

from .redis_memory import RedisWorkingMemory
from .episodic_memory import EpisodicMemory, MemoryResult

if TYPE_CHECKING:
    from orchestrator.skill_store import SkillResult


@dataclass
class MemoryContext:
    """
    Enriched context for an agent before it calls think().
    Rendered as a SYSTEM message prepended to the agent's history.
    """
    working: list[dict] = field(default_factory=list)
    episodic: list[MemoryResult] = field(default_factory=list)
    skills: list["SkillResult"] = field(default_factory=list)

    def is_empty(self) -> bool:
        return not self.working and not self.episodic and not self.skills

    def to_system_prompt(self) -> str:
        """
        Format the memory context as a readable block for injection
        into the agent's system prompt.
        """
        parts = []

        if self.skills:
            parts.append("=== Applicable skills from library ===")
            for r in self.skills:
                parts.append(r.skill.to_context_fragment())

        if self.episodic:
            parts.append("=== Relevant memories from past sessions ===")
            for r in self.episodic:
                sim_pct = int(r.similarity * 100)
                parts.append(f"[{r.agent_id} · sim:{sim_pct}%] {r.content}")

        return "\n".join(parts) if parts else ""

    def active_skill_ids(self) -> list[str]:
        """Return IDs of skills injected, for usage tracking."""
        return [r.skill.id for r in self.skills]


# Minimum importance to store in episodic memory
# Messages shorter than this are likely noise (e.g., "ok", "yes")
_MIN_CONTENT_LEN = 30
_DEFAULT_IMPORTANCE = 0.5


class MemoryManager:
    """
    Facade over RedisWorkingMemory + EpisodicMemory + SkillStore.
    Used by CouncilManager and injected into council.py routes.
    """

    def __init__(
        self,
        working_memory: RedisWorkingMemory,
        episodic_memory: EpisodicMemory,
        skill_store=None,   # Optional[SkillStore] — None when DB unavailable
    ):
        self.working = working_memory
        self.episodic = episodic_memory
        self.skill_store = skill_store

    async def on_message(
        self,
        session_id: str,
        agent_id: str,
        content: str,
        importance: float = _DEFAULT_IMPORTANCE,
    ) -> None:
        """
        Called after every agent message.
        Stores to both tiers concurrently.
        Fire-and-forget via asyncio.create_task() in council router.
        """
        import asyncio

        msg_dict = {
            "agent_id": agent_id,
            "content": content[:500],   # cap for Redis storage
        }

        tasks = [self.working.push_message(session_id, msg_dict)]

        # Only embed substantive messages into episodic memory
        if len(content) >= _MIN_CONTENT_LEN and importance >= _DEFAULT_IMPORTANCE:
            tasks.append(
                self.episodic.store(session_id, agent_id, content, importance=importance)
            )

        await asyncio.gather(*tasks, return_exceptions=True)

    async def recall(
        self,
        session_id: str,
        agent_id: str,
        query: str,
    ) -> MemoryContext:
        """
        Retrieve relevant memories and skills for an agent about to think().
        Returns MemoryContext with working + episodic + skill layers.
        """
        import asyncio

        working_task = asyncio.create_task(
            self.working.get_context(session_id, limit=10)
        )
        episodic_task = asyncio.create_task(
            self.episodic.search(
                query=query,
                agent_id=agent_id,
                session_id_exclude=session_id,  # don't recall from current session
                limit=5,
                min_importance=0.4,
            )
        )

        tasks = [working_task, episodic_task]

        # Skill retrieval: embed query and search skill library
        skill_task = None
        if self.skill_store:
            try:
                query_embedding = await self.episodic._embed(query)
                skill_task = asyncio.create_task(
                    self.skill_store.search(
                        query_embedding=query_embedding,
                        agent_id=agent_id,
                        limit=3,
                        min_similarity=0.55,
                    )
                )
                tasks.append(skill_task)
            except Exception:
                skill_task = None

        results = await asyncio.gather(*tasks, return_exceptions=True)

        working = results[0] if isinstance(results[0], list) else []
        episodic = results[1] if isinstance(results[1], list) else []
        skills = []
        if skill_task is not None and len(results) > 2:
            skills = results[2] if isinstance(results[2], list) else []

        return MemoryContext(
            working=working,
            episodic=episodic,
            skills=skills,
        )
