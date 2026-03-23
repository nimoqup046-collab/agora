"""
CouncilManager — Central registry for agent instances and active sessions.
Singleton pattern; initialized at app startup.
"""

from __future__ import annotations

import sys
import os
from typing import Optional

# Monorepo: add packages/ to path for local dev; installed in Docker
_PKG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "packages")
if os.path.isdir(_PKG_PATH) and _PKG_PATH not in sys.path:
    sys.path.insert(0, _PKG_PATH)

from adapter import ClaudeAdapter, CodexAdapter, MetaAgent, IAgent
from orchestrator.session import SessionStore, Session
from orchestrator.turn_engine import TurnEngine, TurnStrategy
from orchestrator.consensus import ConsensusEngine

from .config import settings


class CouncilManager:
    """
    Manages the agent registry and session store for the AGORA council.
    """

    def __init__(self):
        self._agents: dict[str, IAgent] = {}
        self.sessions = SessionStore()
        self.consensus = ConsensusEngine()
        self._initialized = False

    def initialize(self) -> None:
        """Boot the council: register default agents."""
        if self._initialized:
            return

        # Register Claude as Architect
        claude = ClaudeAdapter(
            agent_id="claude-architect",
            name="Claude",
            model=settings.default_model_claude,
            api_key=settings.anthropic_api_key or None,
        )
        self._agents[claude.agent_id] = claude

        # Register Codex as Implementer
        codex = CodexAdapter(
            agent_id="codex-implementer",
            name="Codex",
            model=settings.default_model_codex,
            api_key=settings.openai_api_key or None,
        )
        self._agents[codex.agent_id] = codex

        # Register Meta-Agent as Conductor
        meta = MetaAgent(
            agent_id="meta-conductor",
            name="Meta-Agent",
            model="claude-sonnet-4-6",
            api_key=settings.anthropic_api_key or None,
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
