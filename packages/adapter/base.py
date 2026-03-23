"""
IAgent — Unified Agent Protocol for AGORA Council.

Every agent (Claude, Codex, Meta, custom) implements this interface,
enabling the orchestrator to treat all agents uniformly.
"""

from __future__ import annotations

import enum
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import AsyncIterator, Optional


class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class AgentRole(str, enum.Enum):
    ARCHITECT = "architect"      # High-level design & strategy
    IMPLEMENTER = "implementer"  # Code generation & execution
    REVIEWER = "reviewer"        # Code review & critique
    CONDUCTOR = "conductor"      # Orchestration & consensus
    SCIENTIST = "scientist"      # Research & hypothesis formation


class AgentCapability(str, enum.Enum):
    CODE_GENERATION = "code_generation"
    CODE_REVIEW = "code_review"
    ARCHITECTURE = "architecture"
    RESEARCH = "research"
    CONSENSUS = "consensus"
    PR_AUTOMATION = "pr_automation"
    MEMORY_ACCESS = "memory_access"


@dataclass
class AgentMessage:
    role: MessageRole
    content: str
    agent_id: Optional[str] = None
    metadata: dict = field(default_factory=dict)


class IAgent(ABC):
    """
    Unified agent interface.
    All providers (Claude, Codex, Meta) implement this contract.
    """

    def __init__(
        self,
        agent_id: str,
        name: str,
        role: AgentRole,
        capabilities: list[AgentCapability],
        system_prompt: str = "",
    ):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.capabilities = capabilities
        self.system_prompt = system_prompt
        self._is_active = False

    @property
    def is_active(self) -> bool:
        return self._is_active

    @abstractmethod
    async def think(
        self,
        messages: list[AgentMessage],
        context: Optional[dict] = None,
    ) -> AgentMessage:
        """
        Synchronous reasoning: return a complete response.
        """

    @abstractmethod
    async def think_stream(
        self,
        messages: list[AgentMessage],
        context: Optional[dict] = None,
    ) -> AsyncIterator[str]:
        """
        Streaming reasoning: yield response tokens as they arrive.
        """

    async def review(
        self,
        target: str,
        criteria: Optional[list[str]] = None,
    ) -> AgentMessage:
        """
        Review an artifact (code, plan, proposal) against criteria.
        Default implementation calls think() with a review prompt.
        """
        review_prompt = f"Review the following:\n\n{target}"
        if criteria:
            review_prompt += f"\n\nCriteria: {', '.join(criteria)}"
        messages = [AgentMessage(role=MessageRole.USER, content=review_prompt)]
        return await self.think(messages)

    async def evolve(self, feedback: str) -> None:
        """
        Incorporate feedback to evolve the agent's system prompt / strategy.
        Default: append to system prompt. Subclasses can override for deeper evolution.
        """
        self.system_prompt += f"\n\n[Evolution note]: {feedback}"

    def to_dict(self) -> dict:
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "role": self.role.value,
            "capabilities": [c.value for c in self.capabilities],
            "is_active": self._is_active,
        }
