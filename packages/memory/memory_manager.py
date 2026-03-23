"""
MemoryManager — Unified facade over all memory tiers.

Orchestrates:
  - RedisWorkingMemory  (hot: current-session context, milliseconds)
  - EpisodicMemory      (warm: cross-session semantic recall, seconds)

Usage in council router:
  1. Before agent.think_stream():  ctx = await memory.recall(...)
  2. After agent response saved:   asyncio.create_task(memory.on_message(...))
     (fire-and-forget — does not block the SSE stream)
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .redis_memory import RedisWorkingMemory
from .episodic_memory import EpisodicMemory, MemoryResult


@dataclass
class MemoryContext:
    """
    Enriched context for an agent before it calls think().
    Rendered as a SYSTEM message prepended to the agent's history.
    """
    working: list[dict] = field(default_factory=list)
    episodic: list[MemoryResult] = field(default_factory=list)

    def is_empty(self) -> bool:
        return not self.working and not self.episodic

    def to_system_prompt(self) -> str:
        """
        Format the memory context as a readable block for injection
        into the agent's system prompt.
        """
        parts = []

        if self.episodic:
            parts.append("=== Relevant memories from past sessions ===")
            for r in self.episodic:
                sim_pct = int(r.similarity * 100)
                parts.append(f"[{r.agent_id} · sim:{sim_pct}%] {r.content}")

        return "\n".join(parts) if parts else ""


# Minimum importance to store in episodic memory
# Messages shorter than this are likely noise (e.g., "ok", "yes")
_MIN_CONTENT_LEN = 30
_DEFAULT_IMPORTANCE = 0.5


class MemoryManager:
    """
    Facade over RedisWorkingMemory + EpisodicMemory.
    Used by CouncilManager and injected into council.py routes.
    """

    def __init__(
        self,
        working_memory: RedisWorkingMemory,
        episodic_memory: EpisodicMemory,
    ):
        self.working = working_memory
        self.episodic = episodic_memory

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
        Retrieve relevant memories for an agent about to think().
        Returns MemoryContext with working + episodic layers.
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

        working, episodic = await asyncio.gather(
            working_task, episodic_task, return_exceptions=True
        )

        return MemoryContext(
            working=working if isinstance(working, list) else [],
            episodic=episodic if isinstance(episodic, list) else [],
        )
