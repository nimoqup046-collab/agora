"""
AGORA Agent Adapter Package
Unified interface for all agent providers.
"""

from .base import IAgent, AgentMessage, AgentRole, AgentCapability, MessageRole
from .claude_adapter import ClaudeAdapter
from .codex_adapter import CodexAdapter
from .meta_agent import MetaAgent

__all__ = [
    "IAgent",
    "AgentMessage",
    "AgentRole",
    "AgentCapability",
    "MessageRole",
    "ClaudeAdapter",
    "CodexAdapter",
    "MetaAgent",
]
