"""
/council — Core council collaboration endpoints with SSE streaming.

Key endpoints:
  POST /council/{session_id}/message       — User sends a message; single agent responds
  GET  /council/{session_id}/stream        — SSE: full multi-agent round (streaming)
  POST /council/{session_id}/round         — Trigger a full council round (non-streaming)
  POST /council/{session_id}/vote          — Call a council vote on a topic
  POST /council/{session_id}/decompose     — Meta-Agent decomposes the task
"""

from __future__ import annotations

import asyncio
import json
import sys
import os
from typing import AsyncIterator, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

_PKG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "packages")
if os.path.isdir(_PKG_PATH) and _PKG_PATH not in sys.path:
    sys.path.insert(0, _PKG_PATH)
from adapter.base import AgentMessage, MessageRole
from orchestrator.consensus import Vote, VoteOption
from orchestrator.turn_engine import TurnStrategy

from ..core.council import council

router = APIRouter(prefix="/council", tags=["council"])


class UserMessage(BaseModel):
    content: str
    agent_id: Optional[str] = None  # If None, routes to all agents in a round


class VoteRequest(BaseModel):
    topic: str
    agent_votes: dict[str, str]  # agent_id -> "agree"|"disagree"|"abstain"
    rationales: dict[str, str] = {}  # agent_id -> rationale text


class DecomposeRequest(BaseModel):
    task: Optional[str] = None  # If None, uses session task


# ── Helpers ──────────────────────────────────────────────────────────────────

def _build_agent_messages(session_history: list[dict]) -> list[AgentMessage]:
    """Convert session history dicts to AgentMessage list."""
    messages = []
    for item in session_history:
        role = MessageRole.USER if item["role"] == "user" else MessageRole.ASSISTANT
        messages.append(AgentMessage(role=role, content=item["content"]))
    return messages


async def _stream_agent_response(session_id: str, agent_id: str, user_content: str) -> AsyncIterator[str]:
    """
    Stream a single agent's response, yielding SSE-formatted events.
    """
    session = council.sessions.get(session_id)
    if not session:
        yield f"data: {json.dumps({'error': 'Session not found'})}\n\n"
        return

    agent = council.get_agent(agent_id)
    if not agent:
        yield f"data: {json.dumps({'error': f'Agent {agent_id} not found'})}\n\n"
        return

    # Yield agent-start event
    yield f"data: {json.dumps({'type': 'agent_start', 'agent_id': agent_id, 'agent_name': agent.name})}\n\n"

    # Build history for this agent
    history = session.get_history_for_agent(agent_id)
    history.append({"role": "user", "content": user_content})
    messages = _build_agent_messages(history)

    # Stream the response
    full_response = []
    async for token in agent.think_stream(messages):
        full_response.append(token)
        yield f"data: {json.dumps({'type': 'token', 'agent_id': agent_id, 'token': token})}\n\n"

    # Save to session
    complete_response = "".join(full_response)
    session.add_message(
        agent_id=agent_id,
        agent_name=agent.name,
        content=complete_response,
    )

    yield f"data: {json.dumps({'type': 'agent_done', 'agent_id': agent_id, 'agent_name': agent.name})}\n\n"


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/{session_id}/message")
async def send_message(session_id: str, body: UserMessage):
    """
    Send a user message and get a response from one agent (non-streaming).
    If agent_id is not specified, the Meta-Agent responds by default.
    """
    session = council.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    agent_id = body.agent_id or "meta-conductor"
    agent = council.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    # Record user message
    session.add_message(agent_id="user", agent_name="User", content=body.content)

    # Build history and think
    history = session.get_history_for_agent(agent_id)
    messages = _build_agent_messages(history)

    response = await agent.think(messages)

    # Record response
    msg = session.add_message(
        agent_id=agent.agent_id,
        agent_name=agent.name,
        content=response.content,
        metadata=response.metadata,
    )

    return {
        "message_id": msg.id,
        "agent_id": agent.agent_id,
        "agent_name": agent.name,
        "content": response.content,
    }


@router.get("/{session_id}/stream")
async def stream_round(session_id: str, user_message: str, turns: int = 1):
    """
    SSE endpoint: streams a full council round.
    Each participating agent responds in turn, with tokens streamed live.

    Query params:
      user_message: the prompt to send to the council
      turns: how many full rounds to run (default 1)
    """
    session = council.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    async def event_generator() -> AsyncIterator[str]:
        # Record user message
        session.add_message(agent_id="user", agent_name="User", content=user_message)
        yield f"data: {json.dumps({'type': 'session_start', 'session_id': session_id})}\n\n"

        turn_engine = council.build_turn_engine(session, TurnStrategy.CONDUCTOR_LED)

        for turn_num in range(turns * len(session.participant_ids)):
            if turn_num >= turns * len(session.participant_ids):
                break

            turn = turn_engine.next_turn()
            agent = council.get_agent(turn.agent_id)
            if not agent:
                continue

            # Build this agent's view of the conversation
            history = session.get_history_for_agent(turn.agent_id)
            messages = _build_agent_messages(history)

            yield f"data: {json.dumps({'type': 'agent_start', 'agent_id': turn.agent_id, 'agent_name': agent.name, 'turn': turn_num + 1})}\n\n"

            full_response = []
            try:
                async for token in agent.think_stream(messages):
                    full_response.append(token)
                    yield f"data: {json.dumps({'type': 'token', 'agent_id': turn.agent_id, 'token': token})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'agent_id': turn.agent_id, 'error': str(e)})}\n\n"
                continue

            complete = "".join(full_response)
            session.add_message(
                agent_id=agent.agent_id,
                agent_name=agent.name,
                content=complete,
            )

            yield f"data: {json.dumps({'type': 'agent_done', 'agent_id': turn.agent_id, 'agent_name': agent.name})}\n\n"
            await asyncio.sleep(0.1)  # Brief pause between agents

        yield f"data: {json.dumps({'type': 'round_complete', 'turn_count': turn_engine.turn_count})}\n\n"
        yield "data: [DONE]\n\n"

    return EventSourceResponse(event_generator())


@router.post("/{session_id}/round")
async def run_round(session_id: str, body: UserMessage):
    """
    Run a full council round (non-streaming). All agents respond in turn.
    Returns all responses when complete.
    """
    session = council.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Record user message
    session.add_message(agent_id="user", agent_name="User", content=body.content)

    turn_engine = council.build_turn_engine(session, TurnStrategy.CONDUCTOR_LED)
    responses = []

    for _ in range(len(session.participant_ids)):
        turn = turn_engine.next_turn()
        agent = council.get_agent(turn.agent_id)
        if not agent:
            continue

        history = session.get_history_for_agent(turn.agent_id)
        messages = _build_agent_messages(history)

        try:
            response = await agent.think(messages)
            session.add_message(
                agent_id=agent.agent_id,
                agent_name=agent.name,
                content=response.content,
                metadata=response.metadata,
            )
            responses.append({
                "agent_id": agent.agent_id,
                "agent_name": agent.name,
                "content": response.content,
            })
        except Exception as e:
            responses.append({
                "agent_id": turn.agent_id,
                "error": str(e),
            })

    return {"responses": responses, "turn_count": turn_engine.turn_count}


@router.post("/{session_id}/vote")
async def council_vote(session_id: str, body: VoteRequest):
    """
    Record and tally a council vote on a topic.
    """
    session = council.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    votes = []
    for agent_id, option_str in body.agent_votes.items():
        agent = council.get_agent(agent_id)
        try:
            option = VoteOption(option_str)
        except ValueError:
            option = VoteOption.ABSTAIN

        votes.append(Vote(
            agent_id=agent_id,
            agent_name=agent.name if agent else agent_id,
            option=option,
            rationale=body.rationales.get(agent_id, ""),
        ))

    result = council.consensus.tally(body.topic, votes)
    return result.to_dict()


@router.post("/{session_id}/decompose")
async def decompose_task(session_id: str, body: DecomposeRequest):
    """
    Meta-Agent decomposes the session task into sub-tasks with agent assignments.
    """
    session = council.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    meta = council.get_agent("meta-conductor")
    if not meta:
        raise HTTPException(status_code=503, detail="Meta-Agent not available")

    task = body.task or session.task
    decomposition = await meta.decompose_task(task)
    return {"session_id": session_id, "task": task, **decomposition}
