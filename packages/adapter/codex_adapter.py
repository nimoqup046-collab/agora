"""
CodexAdapter — OpenAI GPT/Codex integration for AGORA.
Default role: Implementer — code generation and execution.
"""

from __future__ import annotations

import os
from typing import AsyncIterator, Optional

from openai import AsyncOpenAI

from .base import (
    AgentCapability,
    AgentMessage,
    AgentRole,
    IAgent,
    MessageRole,
)


class CodexAdapter(IAgent):
    """
    Adapter for OpenAI models (GPT-4o, o1, etc.).
    Default role: Implementer — code generation and problem solving.
    """

    DEFAULT_SYSTEM_PROMPT = """You are Codex, participating as an expert member of AGORA — a multi-agent
intelligence council. You collaborate with other AI agents (Claude, Meta-Agent) to solve hard
engineering and research problems.

Your strengths: code generation, algorithmic thinking, rapid implementation, and testing.
Always be concise, produce working code when asked, and flag potential issues proactively.
When reviewing others' ideas, focus on practical implementability."""

    def __init__(
        self,
        agent_id: str = "codex-implementer",
        name: str = "Codex",
        role: AgentRole = AgentRole.IMPLEMENTER,
        capabilities: Optional[list[AgentCapability]] = None,
        system_prompt: Optional[str] = None,
        model: str = "gpt-4o",
        api_key: Optional[str] = None,
        max_tokens: int = 4096,
        base_url: Optional[str] = None,
    ):
        super().__init__(
            agent_id=agent_id,
            name=name,
            role=role,
            capabilities=capabilities or [
                AgentCapability.CODE_GENERATION,
                AgentCapability.CODE_REVIEW,
                AgentCapability.PR_AUTOMATION,
            ],
            system_prompt=system_prompt or self.DEFAULT_SYSTEM_PROMPT,
        )
        self.model = model
        self.max_tokens = max_tokens
        self._client = AsyncOpenAI(
            api_key=api_key or os.environ.get("OPENAI_API_KEY", ""),
            base_url=base_url or None,
        )
        self._is_active = True

    def _build_messages(self, messages: list[AgentMessage]) -> list[dict]:
        result = []
        has_system = False
        for msg in messages:
            if msg.role == MessageRole.SYSTEM:
                if not has_system:
                    result.insert(0, {"role": "system", "content": self.system_prompt + "\n\n" + msg.content})
                    has_system = True
                continue
            result.append({"role": msg.role.value, "content": msg.content})

        if not has_system:
            result.insert(0, {"role": "system", "content": self.system_prompt})

        return result

    async def think(
        self,
        messages: list[AgentMessage],
        context: Optional[dict] = None,
    ) -> AgentMessage:
        api_messages = self._build_messages(messages)

        response = await self._client.chat.completions.create(
            model=self.model,
            max_tokens=self.max_tokens,
            messages=api_messages,
        )

        content = response.choices[0].message.content or ""
        return AgentMessage(
            role=MessageRole.ASSISTANT,
            content=content,
            agent_id=self.agent_id,
            metadata={"model": self.model},
        )

    async def think_stream(
        self,
        messages: list[AgentMessage],
        context: Optional[dict] = None,
    ) -> AsyncIterator[str]:
        api_messages = self._build_messages(messages)

        stream = await self._client.chat.completions.create(
            model=self.model,
            max_tokens=self.max_tokens,
            messages=api_messages,
            stream=True,
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
