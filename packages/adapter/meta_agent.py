"""
MetaAgent — The AGORA Conductor / Orchestrator Agent.

MetaAgent does not call an external LLM directly for its core logic.
It uses Claude (or configurable backend) to reason about task decomposition,
turn-taking decisions, and consensus evaluation.

Role: CONDUCTOR — manages the council session, assigns tasks, calls votes.
"""

from __future__ import annotations

import json
from typing import AsyncIterator, Optional

from .base import (
    AgentCapability,
    AgentMessage,
    AgentRole,
    IAgent,
    MessageRole,
)
from .claude_adapter import ClaudeAdapter


CONDUCTOR_SYSTEM_PROMPT = """You are the Meta-Agent — the conductor of the AGORA intelligence council.
Your role is to orchestrate collaboration between Claude (Architect) and Codex (Implementer).

Responsibilities:
1. Decompose complex tasks into sub-tasks and assign them to the right agent.
2. Manage turn-taking: decide which agent speaks next and why.
3. Detect consensus or conflict between agents and surface it clearly.
4. Summarize council decisions into actionable outputs (code, PRs, plans).
5. Call for votes when agents disagree; break ties with reasoned judgment.

Be authoritative, concise, and impartial. Your job is to make the council more effective
than any individual agent could be alone."""


class MetaAgent(IAgent):
    """
    Conductor agent backed by Claude.
    Orchestrates the council's session flow.
    """

    def __init__(
        self,
        agent_id: str = "meta-conductor",
        name: str = "Meta-Agent",
        model: str = "claude-sonnet-4-6",
        api_key: Optional[str] = None,
    ):
        super().__init__(
            agent_id=agent_id,
            name=name,
            role=AgentRole.CONDUCTOR,
            capabilities=[
                AgentCapability.CONSENSUS,
                AgentCapability.ARCHITECTURE,
                AgentCapability.MEMORY_ACCESS,
            ],
            system_prompt=CONDUCTOR_SYSTEM_PROMPT,
        )
        self._backend = ClaudeAdapter(
            agent_id=f"{agent_id}-backend",
            name="Meta-Backend",
            role=AgentRole.CONDUCTOR,
            system_prompt=CONDUCTOR_SYSTEM_PROMPT,
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

    async def decompose_task(self, task: str) -> dict:
        """
        Break a task into sub-tasks with agent assignments.
        Returns: { "subtasks": [{ "id", "description", "assigned_to", "priority" }] }
        """
        prompt = f"""Decompose the following task for the AGORA council.
Return a JSON object with key "subtasks", each having: id, description, assigned_to (claude/codex/both), priority (1-5).

Task: {task}

JSON only, no explanation:"""
        messages = [AgentMessage(role=MessageRole.USER, content=prompt)]
        response = await self._backend.think(messages)

        try:
            # Strip markdown code fences if present
            content = response.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            return json.loads(content)
        except (json.JSONDecodeError, IndexError):
            return {"subtasks": [{"id": 1, "description": task, "assigned_to": "both", "priority": 1}]}

    async def evaluate_consensus(
        self,
        topic: str,
        agent_responses: dict[str, str],
    ) -> dict:
        """
        Evaluate whether agents have reached consensus on a topic.
        Returns: { "consensus": bool, "summary": str, "action": str }
        """
        responses_text = "\n\n".join(
            f"[{agent}]: {response}" for agent, response in agent_responses.items()
        )
        prompt = f"""Evaluate consensus among council members on: "{topic}"

Agent responses:
{responses_text}

Return JSON with: consensus (bool), summary (str), action (str: "proceed"|"vote"|"clarify").
JSON only:"""
        messages = [AgentMessage(role=MessageRole.USER, content=prompt)]
        response = await self._backend.think(messages)

        try:
            content = response.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            return json.loads(content)
        except (json.JSONDecodeError, IndexError):
            return {"consensus": False, "summary": "Unable to evaluate", "action": "clarify"}
