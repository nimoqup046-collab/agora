"""
EvolutorAgent — Meta-learning agent for AGORA's Evolution Engine.

Analyzes session history for a given agent and produces a new, improved
system prompt (SOUL) based on what worked and what didn't.
The draft SOUL requires human approval before becoming active.

Pattern: same backend delegation as MetaAgent (Claude or OpenAI-compatible).
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import AsyncIterator, Optional

from .base import (
    AgentCapability,
    AgentMessage,
    AgentRole,
    IAgent,
    MessageRole,
)
from .claude_adapter import ClaudeAdapter
from .codex_adapter import CodexAdapter


EVOLUTOR_SYSTEM_PROMPT = """You are the Evolutor — AGORA's meta-learning agent.

Your sole purpose is to analyze the performance history of other agents and
produce improved system prompts (SOULs) that make them more effective.

When given an agent's current SOUL and a transcript of their recent sessions:
1. Identify patterns: where did the agent excel? Where did it fall short?
2. Note recurring errors, missed opportunities, or communication patterns that confused collaborators.
3. Produce a new, improved SOUL that preserves the agent's core identity but sharpens its capabilities.
4. Write a concise delta_summary (≤150 chars) describing the key improvement.

Output JSON only. No explanation outside the JSON block."""


@dataclass
class SoulDraft:
    agent_id: str
    new_soul: str
    delta_summary: str


class EvolutorAgent(IAgent):
    """
    Analyzes agent history and produces versioned SOUL drafts.
    Backed by Claude (default) or any OpenAI-compatible model.
    """

    def __init__(
        self,
        agent_id: str = "evolutor",
        name: str = "Evolutor",
        model: str = "claude-sonnet-4-6",
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
    ):
        super().__init__(
            agent_id=agent_id,
            name=name,
            role=AgentRole.CONDUCTOR,
            capabilities=[AgentCapability.MEMORY_ACCESS, AgentCapability.RESEARCH],
            system_prompt=EVOLUTOR_SYSTEM_PROMPT,
        )
        if base_url:
            self._backend = CodexAdapter(
                agent_id=f"{agent_id}-backend",
                name="Evolutor-Backend",
                role=AgentRole.CONDUCTOR,
                system_prompt=EVOLUTOR_SYSTEM_PROMPT,
                model=model,
                api_key=api_key,
                base_url=base_url,
            )
        else:
            self._backend = ClaudeAdapter(
                agent_id=f"{agent_id}-backend",
                name="Evolutor-Backend",
                role=AgentRole.CONDUCTOR,
                system_prompt=EVOLUTOR_SYSTEM_PROMPT,
                model=model,
                api_key=api_key,
            )
        self._is_active = True

    async def think(
        self,
        messages: list[AgentMessage],
        context: Optional[dict] = None,
    ) -> AgentMessage:
        response = await self._backend.think(messages, context)
        response.agent_id = self.agent_id
        return response

    async def think_stream(
        self,
        messages: list[AgentMessage],
        context: Optional[dict] = None,
    ) -> AsyncIterator[str]:
        async for token in self._backend.think_stream(messages, context):
            yield token

    async def analyze_and_draft(
        self,
        agent_id: str,
        agent_name: str,
        current_soul: str,
        session_transcripts: list[str],
    ) -> SoulDraft:
        """
        Analyze session history and produce a SOUL draft for the given agent.

        Args:
            agent_id: The agent being evolved (e.g. "claude-architect")
            agent_name: Human-readable name (e.g. "Claude")
            current_soul: The agent's current system prompt
            session_transcripts: List of recent session transcripts showing the agent's contributions

        Returns:
            SoulDraft with new_soul and delta_summary
        """
        transcript_text = "\n\n---SESSION BOUNDARY---\n\n".join(session_transcripts)
        # Truncate to avoid token limits
        if len(transcript_text) > 24000:
            transcript_text = transcript_text[:24000] + "\n...[truncated]"

        prompt = f"""Analyze the performance of the agent "{agent_name}" (id: {agent_id}) and produce an improved SOUL.

CURRENT SOUL:
{current_soul}

RECENT SESSION TRANSCRIPTS (showing only this agent's contributions):
{transcript_text}

Produce a new SOUL that improves this agent based on the evidence above.
Return JSON with exactly these two keys:
{{
  "new_soul": "<complete improved system prompt for the agent>",
  "delta_summary": "<≤150 char description of key improvements>"
}}

JSON only, no other text:"""

        messages = [AgentMessage(role=MessageRole.USER, content=prompt)]
        response = await self._backend.think(messages)

        try:
            content = response.content.strip()
            # Strip markdown code fences if present
            if content.startswith("```"):
                lines = content.split("\n")
                inner = lines[1:-1] if lines[-1].strip() == "```" else lines[1:]
                content = "\n".join(inner)
                if content.startswith("json"):
                    content = content[4:].strip()
            data = json.loads(content)
            return SoulDraft(
                agent_id=agent_id,
                new_soul=data["new_soul"],
                delta_summary=data.get("delta_summary", "Evolved prompt")[:150],
            )
        except (json.JSONDecodeError, KeyError):
            # Graceful fallback: keep current soul, note the failure
            return SoulDraft(
                agent_id=agent_id,
                new_soul=current_soul,
                delta_summary="[Evolution parse error — soul unchanged]",
            )
