"""
IAgent — Unified Agent Protocol for AGORA Council.

Every agent (Claude, Codex, Meta, custom) implements this interface,
enabling the orchestrator to treat all agents uniformly.

Protocol methods:
  think()        — pure reasoning, returns text (AgentMessage)
  think_stream() — streaming reasoning, yields tokens
  act()          — structured action with possible side effects (ActionResult)
  review()       — review an artifact against criteria
  evolve()       — incorporate feedback into agent strategy
"""

from __future__ import annotations

import enum
import json
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import AsyncIterator, Optional


# ── Message types ──────────────────────────────────────────────────────────────

class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class AgentRole(str, enum.Enum):
    ARCHITECT = "architect"
    IMPLEMENTER = "implementer"
    REVIEWER = "reviewer"
    CONDUCTOR = "conductor"
    SCIENTIST = "scientist"


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


# ── Action types (for act()) ───────────────────────────────────────────────────

class ActionType(str, enum.Enum):
    CODE_ARTIFACT = "code_artifact"   # Produce a code file/snippet
    GITHUB_PR     = "github_pr"       # Create or update a GitHub PR
    FILE_WRITE    = "file_write"      # Write a file (sandboxed)
    SEARCH        = "search"          # Web/codebase search
    DELEGATE      = "delegate"        # Ask another agent to handle a subtask
    NOOP          = "noop"            # Agent decided no action needed


# Actions that must not execute without human approval
DESTRUCTIVE_ACTIONS = {ActionType.GITHUB_PR, ActionType.FILE_WRITE}


@dataclass
class ActionRequest:
    """What the orchestrator asks an agent to do."""
    action_type: ActionType
    parameters: dict                    # Type-specific params
    rationale: str = ""


@dataclass
class ActionResult:
    """What the agent returns from act()."""
    action_type: ActionType
    success: bool
    output: dict                        # Type-specific output
    error: Optional[str] = None
    requires_approval: bool = False     # True for destructive actions — human must confirm
    agent_id: Optional[str] = None
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "action_type": self.action_type.value,
            "success": self.success,
            "output": self.output,
            "error": self.error,
            "requires_approval": self.requires_approval,
            "agent_id": self.agent_id,
            "metadata": self.metadata,
        }


# ── IAgent interface ───────────────────────────────────────────────────────────

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

    # ── Core reasoning ────────────────────────────────────────────────────────

    @abstractmethod
    async def think(
        self,
        messages: list[AgentMessage],
        context: Optional[dict] = None,
    ) -> AgentMessage:
        """Pure reasoning — returns a complete text response."""

    @abstractmethod
    async def think_stream(
        self,
        messages: list[AgentMessage],
        context: Optional[dict] = None,
    ) -> AsyncIterator[str]:
        """Streaming reasoning — yields response tokens."""

    # ── Action execution ──────────────────────────────────────────────────────

    async def act(
        self,
        request: ActionRequest,
        context: Optional[dict] = None,
    ) -> ActionResult:
        """
        Execute a structured action.

        Default implementation: calls think() with a structured prompt
        asking the agent to produce a JSON action plan.

        Agents that need real side effects (GitHubClient calls, file writes)
        should override this — or the caller should use /act/confirm.

        IMPORTANT: Destructive action types always set requires_approval=True.
        The caller (council router) must not execute the side effect
        until the user confirms via /act/confirm.
        """
        action_prompt = self._build_action_prompt(request)
        messages = [AgentMessage(role=MessageRole.USER, content=action_prompt)]
        response = await self.think(messages, context)

        try:
            data = json.loads(self._extract_json(response.content))
            return ActionResult(
                action_type=request.action_type,
                success=True,
                output=data,
                requires_approval=request.action_type in DESTRUCTIVE_ACTIONS,
                agent_id=self.agent_id,
            )
        except (json.JSONDecodeError, ValueError) as e:
            return ActionResult(
                action_type=request.action_type,
                success=False,
                output={"raw_response": response.content},
                error=str(e),
                requires_approval=False,
                agent_id=self.agent_id,
            )

    # ── Review & evolve ───────────────────────────────────────────────────────

    async def review(
        self,
        target: str,
        criteria: Optional[list[str]] = None,
    ) -> AgentMessage:
        """Review an artifact against criteria."""
        review_prompt = f"Review the following:\n\n{target}"
        if criteria:
            review_prompt += f"\n\nCriteria: {', '.join(criteria)}"
        messages = [AgentMessage(role=MessageRole.USER, content=review_prompt)]
        return await self.think(messages)

    async def evolve(self, feedback: str) -> None:
        """Incorporate feedback into system prompt strategy."""
        self.system_prompt += f"\n\n[Evolution note]: {feedback}"

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _build_action_prompt(self, request: ActionRequest) -> str:
        return (
            f"You are being asked to plan the following action:\n\n"
            f"Action type: {request.action_type.value}\n"
            f"Parameters: {json.dumps(request.parameters, indent=2)}\n"
            f"Rationale: {request.rationale}\n\n"
            f"Respond with a JSON object describing your action plan. "
            f"Include all fields needed to execute the action. "
            f"JSON only, no explanation:"
        )

    @staticmethod
    def _extract_json(text: str) -> str:
        """Strip markdown code fences if present."""
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            # Remove opening ``` line and closing ``` line
            inner = lines[1:-1] if lines[-1].strip() == "```" else lines[1:]
            text = "\n".join(inner)
        return text

    def to_dict(self) -> dict:
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "role": self.role.value,
            "capabilities": [c.value for c in self.capabilities],
            "is_active": self._is_active,
        }
