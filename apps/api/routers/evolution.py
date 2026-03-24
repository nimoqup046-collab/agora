"""
/evolution — Evolution Engine endpoints.

POST /evolution/trigger         Analyze recent sessions → draft new SOULs
GET  /evolution/souls/{agent_id} List SOUL versions for an agent
POST /evolution/souls/{soul_id}/approve  Human approves + activates a SOUL
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..core.council import council

router = APIRouter(prefix="/evolution", tags=["evolution"])


class TriggerRequest(BaseModel):
    session_count: int = Field(default=10, ge=1, le=50)


class TriggerResponse(BaseModel):
    drafts: list[dict]
    sessions_analyzed: int
    agents_evolved: int


@router.post("/trigger", response_model=TriggerResponse)
async def trigger_evolution(body: TriggerRequest):
    """
    Analyze the most recent N sessions and produce SOUL drafts for each agent.
    Drafts are saved as pending — they require /approve before activating.
    """
    if not council.evolutor:
        raise HTTPException(status_code=503, detail="Evolution engine not initialized")
    if not council.souls:
        raise HTTPException(status_code=503, detail="Soul store not available (no database)")

    # ── Gather recent sessions ───────────────────────────────────────────
    all_sessions = await council.sessions.list_all()

    recent = sorted(all_sessions, key=lambda s: s.updated_at, reverse=True)
    recent = recent[: body.session_count]

    if not recent:
        return TriggerResponse(drafts=[], sessions_analyzed=0, agents_evolved=0)

    # ── Build per-agent transcript ───────────────────────────────────────
    agent_transcripts: dict[str, list[str]] = {
        aid: [] for aid in council._agents
    }
    trigger_session_ids = [s.id for s in recent]

    for session in recent:
        # Fetch full session with messages
        try:
            full = await council.sessions.get(session.id)
        except Exception:
            continue
        if not full or not full.messages:
            continue

        for agent_id in council._agents:
            agent_msgs = [
                f"[{m.agent_name}]: {m.content}"
                for m in full.messages
                if m.agent_id == agent_id
            ]
            if agent_msgs:
                agent_transcripts[agent_id].append("\n".join(agent_msgs))

    # ── Run Evolutor for each agent ──────────────────────────────────────
    drafts = []
    for agent_id, agent in council._agents.items():
        transcripts = agent_transcripts.get(agent_id, [])
        if not transcripts:
            continue  # Skip agents with no activity in recent sessions

        try:
            draft = await council.evolutor.analyze_and_draft(
                agent_id=agent_id,
                agent_name=agent.name,
                current_soul=agent.system_prompt,
                session_transcripts=transcripts,
            )
            soul = await council.souls.save_draft(
                agent_id=agent_id,
                soul_content=draft.new_soul,
                delta_summary=draft.delta_summary,
                trigger_session_ids=trigger_session_ids,
            )
            drafts.append({
                "agent_id": agent_id,
                "soul_id": soul.id,
                "version": soul.version,
                "delta_summary": soul.delta_summary,
            })
        except Exception as e:
            print(f"[evolution] Failed to evolve {agent_id}: {e}")

    return TriggerResponse(
        drafts=drafts,
        sessions_analyzed=len(recent),
        agents_evolved=len(drafts),
    )


@router.get("/souls/{agent_id}")
async def list_souls(agent_id: str):
    """Return SOUL version history for a given agent."""
    if not council.souls:
        raise HTTPException(status_code=503, detail="Soul store not available")

    agent = council.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    souls = await council.souls.list_by_agent(agent_id)
    latest_approved = next((s for s in souls if s.approved_at is not None), None)

    return {
        "agent_id": agent_id,
        "agent_name": agent.name,
        "souls": [s.to_dict() for s in souls],
        "current_version": latest_approved.version if latest_approved else 0,
    }


@router.post("/souls/{soul_id}/approve")
async def approve_soul(soul_id: str):
    """
    Human approves a SOUL draft — marks it as active and immediately updates
    the agent's in-memory system prompt.
    """
    if not council.souls:
        raise HTTPException(status_code=503, detail="Soul store not available")

    soul = await council.souls.approve(soul_id)
    if not soul:
        raise HTTPException(status_code=404, detail=f"Soul '{soul_id}' not found")

    # Immediately update the live agent's system prompt
    agent = council.get_agent(soul.agent_id)
    if agent:
        agent.system_prompt = soul.soul_content

    return {
        "soul": soul.to_dict(),
        "agent_id": soul.agent_id,
        "activated": True,
    }
