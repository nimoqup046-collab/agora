"""
/council — Core council collaboration endpoints.

Endpoints:
  POST /council/{id}/message        — Single agent response (non-streaming)
  GET  /council/{id}/stream         — SSE: full multi-agent round (streaming)
  POST /council/{id}/round          — Full council round (non-streaming)
  POST /council/{id}/vote           — Council vote on a topic
  POST /council/{id}/decompose      — Meta-Agent task decomposition
  POST /council/{id}/act            — Agent produces a structured action plan
  POST /council/{id}/act/confirm    — Execute approved action (GitHub PR, etc.)
"""

from __future__ import annotations

import asyncio
import json
import sys
import os
from typing import AsyncIterator, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

_PKG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "packages")
if os.path.isdir(_PKG_PATH) and _PKG_PATH not in sys.path:
    sys.path.insert(0, _PKG_PATH)

from adapter.base import AgentMessage, MessageRole, ActionType, ActionRequest, ActionResult
from orchestrator.consensus import Vote, VoteOption
from orchestrator.turn_engine import TurnStrategy

from ..core.council import council

router = APIRouter(prefix="/council", tags=["council"])


# ── Request models ─────────────────────────────────────────────────────────────

class UserMessage(BaseModel):
    content: str
    agent_id: Optional[str] = None


class VoteRequest(BaseModel):
    topic: str
    agent_votes: dict[str, str]
    rationales: dict[str, str] = {}


class DecomposeRequest(BaseModel):
    task: Optional[str] = None


class ActRequest(BaseModel):
    agent_id: str
    action_type: str
    parameters: dict = {}
    rationale: str = ""


class ActConfirmRequest(BaseModel):
    action_result: dict          # Serialized ActionResult from /act
    session_id: Optional[str] = None


# ── Helpers ────────────────────────────────────────────────────────────────────

def _build_agent_messages(history: list[dict]) -> list[AgentMessage]:
    msgs = []
    for item in history:
        role = MessageRole.USER if item["role"] == "user" else MessageRole.ASSISTANT
        msgs.append(AgentMessage(role=role, content=item["content"]))
    return msgs


async def _enrich_with_memory(
    session_id: str,
    agent_id: str,
    query: str,
) -> list[AgentMessage]:
    """
    Retrieve memory context and return as a SYSTEM message list.
    Returns empty list if memory is not available.
    """
    if not council.memory:
        return []
    try:
        ctx = await council.memory.recall(session_id, agent_id, query)
        if ctx.is_empty():
            return []
        system_text = ctx.to_system_prompt()
        return [AgentMessage(role=MessageRole.SYSTEM, content=system_text)]
    except Exception:
        return []


def _fire_memory_store(session_id: str, agent_id: str, content: str) -> None:
    """
    Fire-and-forget: store agent response in memory without blocking the SSE stream.
    """
    if council.memory:
        asyncio.create_task(
            council.memory.on_message(session_id, agent_id, content)
        )


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/{session_id}/message")
async def send_message(session_id: str, body: UserMessage):
    """Single agent response (non-streaming)."""
    session = await council.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    agent_id = body.agent_id or "meta-conductor"
    agent = council.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    # Record user message
    await council.sessions.add_message(session_id, "user", "User", body.content)

    # Build history + memory context
    session = await council.sessions.get(session_id)
    history = session.get_history_for_agent(agent_id)
    memory_msgs = await _enrich_with_memory(session_id, agent_id, body.content)
    messages = memory_msgs + _build_agent_messages(history)

    response = await agent.think(messages)

    msg = await council.sessions.add_message(
        session_id, agent.agent_id, agent.name,
        response.content, response.metadata,
    )
    _fire_memory_store(session_id, agent.agent_id, response.content)

    return {
        "message_id": msg.id,
        "agent_id": agent.agent_id,
        "agent_name": agent.name,
        "content": response.content,
    }


@router.get("/{session_id}/stream")
async def stream_round(session_id: str, user_message: str, turns: int = 1):
    """
    SSE endpoint: full multi-agent round with live token streaming.
    Events: session_start | agent_start | token | agent_done | round_complete | error
    """
    session = await council.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    async def event_generator() -> AsyncIterator[str]:
        # Record user message
        await council.sessions.add_message(session_id, "user", "User", user_message)
        yield f"data: {json.dumps({'type': 'session_start', 'session_id': session_id})}\n\n"

        turn_engine = council.build_turn_engine(session, TurnStrategy.CONDUCTOR_LED)
        total_turns = turns * len(session.participant_ids)

        for turn_num in range(total_turns):
            turn = turn_engine.next_turn()
            agent = council.get_agent(turn.agent_id)
            if not agent:
                continue

            # Fetch fresh session state (messages may have grown)
            current_session = await council.sessions.get(session_id)
            history = current_session.get_history_for_agent(turn.agent_id)
            memory_msgs = await _enrich_with_memory(session_id, turn.agent_id, user_message)
            messages = memory_msgs + _build_agent_messages(history)

            yield f"data: {json.dumps({'type': 'agent_start', 'agent_id': turn.agent_id, 'agent_name': agent.name, 'turn': turn_num + 1})}\n\n"

            full_response: list[str] = []
            try:
                async for token in agent.think_stream(messages):
                    full_response.append(token)
                    yield f"data: {json.dumps({'type': 'token', 'agent_id': turn.agent_id, 'token': token})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'agent_id': turn.agent_id, 'error': str(e)})}\n\n"
                continue

            complete = "".join(full_response)
            await council.sessions.add_message(
                session_id, agent.agent_id, agent.name, complete
            )
            _fire_memory_store(session_id, agent.agent_id, complete)

            yield f"data: {json.dumps({'type': 'agent_done', 'agent_id': turn.agent_id, 'agent_name': agent.name})}\n\n"
            await asyncio.sleep(0.05)

        yield f"data: {json.dumps({'type': 'round_complete', 'turn_count': turn_engine.turn_count})}\n\n"
        yield "data: [DONE]\n\n"

    return EventSourceResponse(event_generator())


@router.post("/{session_id}/round")
async def run_round(session_id: str, body: UserMessage):
    """Full council round, non-streaming. All agents respond in turn."""
    session = await council.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    await council.sessions.add_message(session_id, "user", "User", body.content)

    turn_engine = council.build_turn_engine(session, TurnStrategy.CONDUCTOR_LED)
    responses = []

    for _ in range(len(session.participant_ids)):
        turn = turn_engine.next_turn()
        agent = council.get_agent(turn.agent_id)
        if not agent:
            continue

        current_session = await council.sessions.get(session_id)
        history = current_session.get_history_for_agent(turn.agent_id)
        memory_msgs = await _enrich_with_memory(session_id, turn.agent_id, body.content)
        messages = memory_msgs + _build_agent_messages(history)

        try:
            response = await agent.think(messages)
            await council.sessions.add_message(
                session_id, agent.agent_id, agent.name,
                response.content, response.metadata,
            )
            _fire_memory_store(session_id, agent.agent_id, response.content)
            responses.append({
                "agent_id": agent.agent_id,
                "agent_name": agent.name,
                "content": response.content,
            })
        except Exception as e:
            responses.append({"agent_id": turn.agent_id, "error": str(e)})

    return {"responses": responses, "turn_count": turn_engine.turn_count}


@router.post("/{session_id}/vote")
async def council_vote(session_id: str, body: VoteRequest):
    """Record and tally a council vote."""
    session = await council.sessions.get(session_id)
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
    """Meta-Agent decomposes the session task into sub-tasks."""
    session = await council.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    meta = council.get_agent("meta-conductor")
    if not meta:
        raise HTTPException(status_code=503, detail="Meta-Agent not available")

    task = body.task or session.task
    decomposition = await meta.decompose_task(task)
    return {"session_id": session_id, "task": task, **decomposition}


@router.post("/{session_id}/act")
async def request_action(session_id: str, body: ActRequest):
    """
    Ask an agent to produce a structured action plan.

    For GITHUB_PR and FILE_WRITE, the result will have requires_approval=True.
    The caller must display this to the user and call /act/confirm to execute.
    """
    session = await council.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    agent = council.get_agent(body.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{body.agent_id}' not found")

    try:
        action_type = ActionType(body.action_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unknown action_type: {body.action_type}")

    request = ActionRequest(
        action_type=action_type,
        parameters=body.parameters,
        rationale=body.rationale,
    )
    result = await agent.act(request)
    return result.to_dict()


@router.post("/{session_id}/act/confirm")
async def confirm_action(session_id: str, body: ActConfirmRequest):
    """
    Execute a previously approved action.
    Currently supports: GITHUB_PR.

    Expected body.action_result (from /act response):
      { action_type, output: { branch, file_path, content, pr_title, pr_body, ... } }
    """
    session = await council.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    ar = body.action_result
    action_type_str = ar.get("action_type", "")

    if action_type_str == ActionType.GITHUB_PR:
        if not council.github:
            raise HTTPException(
                status_code=503,
                detail="GitHub integration not configured. Set GITHUB_TOKEN, GITHUB_DEFAULT_OWNER, GITHUB_DEFAULT_REPO.",
            )

        output = ar.get("output", {})
        branch_name = output.get("branch") or council.github.make_branch_name(
            session_id,
            ar.get("agent_id", "agent"),
            output.get("slug", "pr"),
        )

        try:
            await council.github.create_branch(branch_name)
        except Exception as e:
            # Branch may already exist — continue
            if "Reference already exists" not in str(e):
                raise HTTPException(status_code=502, detail=f"Branch creation failed: {e}")

        # Push files if provided
        files = output.get("files", [])
        if isinstance(files, list):
            for f in files:
                await council.github.push_file(
                    branch=branch_name,
                    file_path=f["path"],
                    content=f["content"],
                    commit_message=f.get("commit_message", f"agora: {f['path']}"),
                )

        pr = await council.github.create_pr(
            branch=branch_name,
            title=output.get("pr_title", f"[AGORA] Session {session_id[:8]}"),
            body=output.get("pr_body", "Created by AGORA multi-agent council."),
        )

        # Record PR creation in session
        await council.sessions.add_message(
            session_id, "system", "AGORA",
            f"GitHub PR created: {pr.pr_url}",
            {"pr_number": pr.pr_number, "pr_url": pr.pr_url},
        )

        return {"status": "pr_created", **pr.to_dict()}

    raise HTTPException(
        status_code=400,
        detail=f"Unsupported action_type for confirm: {action_type_str}",
    )
