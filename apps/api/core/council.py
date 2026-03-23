"""
CouncilManager — Central registry for agent instances and active sessions.
Singleton pattern; initialized at app startup.
"""

from __future__ import annotations

import sys
import os
from typing import Optional, TYPE_CHECKING

# Monorepo: add packages/ to path for local dev; installed in Docker
_PKG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "packages")
if os.path.isdir(_PKG_PATH) and _PKG_PATH not in sys.path:
    sys.path.insert(0, _PKG_PATH)

import asyncpg

from adapter import ClaudeAdapter, CodexAdapter, MetaAgent, IAgent
from adapter.github_client import GitHubClient
from orchestrator.session import SessionStore, Session
from orchestrator.session_postgres import PostgresSessionStore
from orchestrator.turn_engine import TurnEngine, TurnStrategy
from orchestrator.consensus import ConsensusEngine

from .config import settings


class CouncilManager:
    """
    Manages the agent registry, session store, memory, and GitHub client.
    """

    def __init__(self):
        self._agents: dict[str, IAgent] = {}
        self.sessions: SessionStore | PostgresSessionStore = SessionStore()
        self.consensus = ConsensusEngine()
        self.memory = None       # Set in initialize() when pool available
        self.github: Optional[GitHubClient] = None
        self._initialized = False

    def initialize(self, pool: Optional[asyncpg.Pool] = None) -> None:
        """
        Boot the council.
        - If pool is provided: use PostgresSessionStore + MemoryManager
        - Otherwise: in-memory fallback (local dev / tests)
        """
        if self._initialized:
            return

        # ── Session store ──────────────────────────────────────────────────
        if pool:
            self.sessions = PostgresSessionStore(pool)
        else:
            self.sessions = SessionStore()

        # ── Memory manager (lazy import to avoid hard dep if no pool) ──────
        if pool and settings.openai_api_key:
            try:
                from memory.memory_manager import MemoryManager
                from memory.redis_memory import RedisWorkingMemory
                from memory.episodic_memory import EpisodicMemory
                import redis.asyncio as aioredis
                from openai import AsyncOpenAI

                redis_url = os.getenv("REDIS_URL") or f"redis://{settings.redis_host}:{settings.redis_port}"
                redis_client = aioredis.from_url(
                    redis_url,
                    password=settings.redis_password or None if not os.getenv("REDIS_URL") else None,
                    decode_responses=False,
                )
                openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
                working_mem = RedisWorkingMemory(redis_client)
                episodic_mem = EpisodicMemory(pool, openai_client)
                self.memory = MemoryManager(working_mem, episodic_mem)
            except Exception as e:
                print(f"[council] Memory init failed: {e} — running without memory")
                self.memory = None

        # ── GitHub client ──────────────────────────────────────────────────
        if settings.github_token and settings.github_default_owner:
            self.github = GitHubClient(
                token=settings.github_token,
                owner=settings.github_default_owner,
                repo=settings.github_default_repo,
            )

        # ── Agents ─────────────────────────────────────────────────────────
        # DeepSeek mode: use OpenAI-compatible API for all agents (China-accessible)
        _deepseek_key = settings.deepseek_api_key or None
        _deepseek_url = "https://api.deepseek.com" if _deepseek_key else None

        if _deepseek_key:
            claude = CodexAdapter(
                agent_id="claude-architect",
                name="Claude",
                model=settings.default_model_claude,
                api_key=_deepseek_key,
                base_url=_deepseek_url,
            )
        else:
            claude = ClaudeAdapter(
                agent_id="claude-architect",
                name="Claude",
                model=settings.default_model_claude,
                api_key=settings.anthropic_api_key or None,
            )
        self._agents[claude.agent_id] = claude

        codex = CodexAdapter(
            agent_id="codex-implementer",
            name="Codex",
            model=settings.default_model_codex,
            api_key=_deepseek_key or settings.openai_api_key or None,
            base_url=_deepseek_url,
        )
        self._agents[codex.agent_id] = codex

        meta = MetaAgent(
            agent_id="meta-conductor",
            name="Meta-Agent",
            model=settings.default_model_meta,
            api_key=_deepseek_key or settings.anthropic_api_key or None,
            base_url=_deepseek_url,
        )
        self._agents[meta.agent_id] = meta

        self._initialized = True

    def get_agent(self, agent_id: str) -> Optional[IAgent]:
        return self._agents.get(agent_id)

    def list_agents(self) -> list[dict]:
        return [agent.to_dict() for agent in self._agents.values()]

    def build_turn_engine(
        self,
        session: Session,
        strategy: TurnStrategy = TurnStrategy.CONDUCTOR_LED,
    ) -> TurnEngine:
        agent_names = {
            aid: self._agents[aid].name
            for aid in session.participant_ids
            if aid in self._agents
        }
        return TurnEngine(
            agent_ids=session.participant_ids,
            agent_names=agent_names,
            strategy=strategy,
            conductor_id="meta-conductor",
        )


# Global singleton
council = CouncilManager()
