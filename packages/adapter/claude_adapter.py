"""
ClaudeAdapter — Anthropic Claude integration for AGORA.
Supports claude-opus-4-6 and claude-sonnet-4-6.
"""

from __future__ import annotations

import os
from typing import AsyncIterator, Optional

import anthropic

from .base import (
    AgentCapability,
    AgentMessage,
    AgentRole,
    IAgent,
    MessageRole,
)


class ClaudeAdapter(IAgent):
    """
    Adapter for Anthropic Claude models.
    Default role: Architect — deep reasoning, high-level design.
    """

    DEFAULT_SYSTEM_PROMPT = """You are Claude, participating as an expert member of AGORA — a multi-agent
intelligence council. You collaborate with other AI agents (Codex, Meta-Agent) to solve hard
engineering and research problems.

Your strengths: deep reasoning, architecture design, code review, and strategic thinking.
Always be direct, collaborative, and precise. When you disagree, say so clearly with reasoning.
When you agree, affirm and build on the idea. The council depends on honest intellectual exchange."""

    def __init__(
        self,
        agent_id: str = "claude-architect",
        name: str = "Claude",
        role: AgentRole = AgentRole.ARCHITECT,
        capabilities: Optional[list[AgentCapability]] = None,
        system_prompt: Optional[str] = None,
        model: str = "claude-opus-4-6",
        api_key: Optional[str] = None,
        max_tokens: int = 4096,
    ):
        super().__init__(
            agent_id=agent_id,
            name=name,
            role=role,
            capabilities=capabilities or [
                AgentCapability.ARCHITECTURE,
                AgentCapability.CODE_REVIEW,
                AgentCapability.RESEARCH,
                AgentCapability.CONSENSUS,
            ],
            system_prompt=system_prompt or self.DEFAULT_SYSTEM_PROMPT,
        )
        self.model = model
        self.max_tokens = max_tokens
        self._client = anthropic.AsyncAnthropic(
            api_key=api_key or os.environ.get("ANTHROPIC_API_KEY", "")
        )
        self._is_active = True

    def _build_messages(self, messages: list[AgentMessage]) -> list[dict]:
        result = []
        for msg in messages:
            if msg.role == MessageRole.SYSTEM:
                continue  # handled via system param
            result.append({"role": msg.role.value, "content": msg.content})
        return result

    def _extract_system(self, messages: list[AgentMessage]) -> str:
        system_parts = [self.system_prompt]
        for msg in messages:
            if msg.role == MessageRole.SYSTEM:
                system_parts.append(msg.content)
        return "\n\n".join(filter(None, system_parts))

    async def think(
        self,
        messages: list[AgentMessage],
        context: Optional[dict] = None,
    ) -> AgentMessage:
        system = self._extract_system(messages)
        api_messages = self._build_messages(messages)

        response = await self._client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            system=system,
            messages=api_messages,
        )

        content = response.content[0].text
        return AgentMessage(
            role=MessageRole.ASSISTANT,
            content=content,
            agent_id=self.agent_id,
            metadata={"model": self.model, "usage": response.usage.model_dump()},
        )

    async def think_stream(
        self,
        messages: list[AgentMessage],
        context: Optional[dict] = None,
    ) -> AsyncIterator[str]:
        system = self._extract_system(messages)
        api_messages = self._build_messages(messages)

        async with self._client.messages.stream(
            model=self.model,
            max_tokens=self.max_tokens,
            system=system,
            messages=api_messages,
        ) as stream:
            async for text in stream.text_stream:
                yield text
