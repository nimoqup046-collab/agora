"""
AGORA Agent Adapter Package
Unified interface for all agent providers.
"""

from .base import (
    IAgent,
    AgentMessage,
    AgentRole,
    AgentCapability,
    MessageRole,
    ActionType,
    ActionRequest,
    ActionResult,
    DESTRUCTIVE_ACTIONS,
)
from .claude_adapter import ClaudeAdapter
from .codex_adapter import CodexAdapter
from .meta_agent import MetaAgent
from .evolutor_agent import EvolutorAgent, SoulDraft
from .github_client import GitHubClient, PRResult

__all__ = [
    "IAgent",
    "AgentMessage",
    "AgentRole",
    "AgentCapability",
    "MessageRole",
    "ActionType",
    "ActionRequest",
    "ActionResult",
    "DESTRUCTIVE_ACTIONS",
    "ClaudeAdapter",
    "CodexAdapter",
    "MetaAgent",
    "EvolutorAgent",
    "SoulDraft",
    "GitHubClient",
    "PRResult",
]
