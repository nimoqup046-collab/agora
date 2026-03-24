"""
EvolutorAgent — Meta-learning agent for AGORA's Evolution Engine.

Two responsibilities:
  1. analyze_and_draft()        — rewrites agent SOULs from session history
  2. extract_skills()           — distils reusable Skill patterns from sessions
  3. score_skill_usage()        — retroactively rates how well a skill helped

Pattern: same backend delegation as MetaAgent (Claude or OpenAI-compatible).
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
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


@dataclass
class SkillDraft:
    """A candidate skill extracted from session transcripts."""
    name: str
    description: str
    domain: str             # "debugging"|"architecture"|"scientific"|"review"|"general"
    template: str           # prompt fragment to inject before think()
    examples: list[dict] = field(default_factory=list)   # [{input, output}]
    source_session_ids: list[str] = field(default_factory=list)


SKILL_EXTRACTION_PROMPT = """You are the Evolutor — AGORA's meta-learning agent.

Given a set of session transcripts, identify 1-3 REUSABLE reasoning patterns
that appeared across multiple exchanges and proved effective.

A reusable pattern is:
- Generalizable beyond this specific session (not a one-time observation)
- Expressed as a compact prompt fragment an agent can follow (≤400 chars)
- Grounded in evidence from the transcripts

For each pattern, output a JSON object with these fields:
{
  "name": "Short skill name (≤50 chars)",
  "description": "One sentence: what this skill does",
  "domain": "one of: architecture|debugging|scientific|review|general",
  "template": "The prompt fragment injected before think(). Instructions only, no explanation.",
  "examples": [{"input": "...", "output": "..."}]
}

Return a JSON array of 1-3 skill objects. If no generalizable patterns exist, return [].
JSON only. No explanation outside the JSON."""


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

    async def extract_skills(
        self,
        session_transcripts: list[str],
        source_session_ids: list[str],
    ) -> list[SkillDraft]:
        """
        Analyze cross-session transcripts and extract reusable Skill patterns.

        Unlike analyze_and_draft() which is per-agent, this analyses the full
        council conversation to find patterns that any agent could apply.

        Args:
            session_transcripts: Full session transcripts (all agents)
            source_session_ids: Session IDs for provenance tracking

        Returns:
            List of SkillDraft objects (may be empty if no patterns found)
        """
        if not session_transcripts:
            return []

        combined = "\n\n---SESSION BOUNDARY---\n\n".join(session_transcripts)
        if len(combined) > 20000:
            combined = combined[:20000] + "\n...[truncated]"

        # Use a temporary system prompt swap for skill extraction
        original_system = self._backend.system_prompt
        self._backend.system_prompt = SKILL_EXTRACTION_PROMPT

        try:
            prompt = f"""Analyze these council session transcripts and extract reusable reasoning patterns.

SESSION TRANSCRIPTS:
{combined}

Return a JSON array of 1-3 skill objects (or [] if nothing generalizable):"""

            messages = [AgentMessage(role=MessageRole.USER, content=prompt)]
            response = await self._backend.think(messages)
        finally:
            self._backend.system_prompt = original_system

        try:
            content = response.content.strip()
            if content.startswith("```"):
                lines = content.split("\n")
                inner = lines[1:-1] if lines[-1].strip() == "```" else lines[1:]
                content = "\n".join(inner)
                if content.startswith("json"):
                    content = content[4:].strip()
            data = json.loads(content)
            if not isinstance(data, list):
                return []

            drafts = []
            for item in data[:3]:   # hard cap at 3
                if not all(k in item for k in ("name", "description", "domain", "template")):
                    continue
                drafts.append(SkillDraft(
                    name=str(item["name"])[:80],
                    description=str(item["description"])[:200],
                    domain=str(item.get("domain", "general")),
                    template=str(item["template"])[:500],
                    examples=list(item.get("examples", []))[:3],
                    source_session_ids=source_session_ids,
                ))
            return drafts

        except (json.JSONDecodeError, TypeError):
            return []

    async def score_skill_usage(
        self,
        skill_name: str,
        skill_template: str,
        session_transcript: str,
    ) -> float:
        """
        Score how effectively a skill was used in a session (0.0-1.0).
        Called by /evolution/trigger to populate skill_usage_log.outcome_quality.

        Returns:
            Float 0.0-1.0 quality score, or 0.5 as neutral fallback on error.
        """
        prompt = f"""You are scoring the effectiveness of an AI reasoning skill.

SKILL NAME: {skill_name}
SKILL TEMPLATE: {skill_template}

SESSION TRANSCRIPT (excerpt):
{session_transcript[:6000]}

Rate 0.0-1.0: Did application of this skill pattern improve the quality of the agent's reasoning?
- 0.0 = Skill was irrelevant or harmful
- 0.5 = Neutral, unclear impact
- 1.0 = Skill clearly improved the response quality

Return JSON only: {{"score": <float 0.0-1.0>, "reason": "<≤80 chars>"}}"""

        messages = [AgentMessage(role=MessageRole.USER, content=prompt)]
        try:
            response = await self._backend.think(messages)
            content = response.content.strip()
            if content.startswith("```"):
                lines = content.split("\n")
                inner = lines[1:-1] if lines[-1].strip() == "```" else lines[1:]
                content = "\n".join(inner)
            data = json.loads(content)
            score = float(data.get("score", 0.5))
            return max(0.0, min(1.0, score))
        except Exception:
            return 0.5
