"""
/evolution — Evolution Engine endpoints.

POST /evolution/trigger              Analyze sessions → draft SOULs + extract Skills
GET  /evolution/souls/{agent_id}     List SOUL versions for an agent
POST /evolution/souls/{soul_id}/approve  Human approves + activates a SOUL
POST /evolution/score-skills         Evolutor retroactively scores skill usage quality
POST /evolution/retire-skills        Auto-retire weak skills (Phase C)
"""

import asyncio
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..core.council import council

# Phase C: auto-approve extracted skills when env var is set
_AUTO_APPROVE_SKILLS = os.getenv("AUTO_APPROVE_SKILLS", "").lower() in ("1", "true", "yes")

router = APIRouter(prefix="/evolution", tags=["evolution"])


class TriggerRequest(BaseModel):
    session_count: int = Field(default=10, ge=1, le=50)
    extract_skills: bool = Field(default=True, description="Also run skill extraction from sessions")


class TriggerResponse(BaseModel):
    drafts: list[dict]
    sessions_analyzed: int
    agents_evolved: int
    skills_extracted: int = 0


class ScoreSkillsRequest(BaseModel):
    limit: int = Field(default=20, ge=1, le=100, description="Max unscored entries to process")


class RetireSkillsRequest(BaseModel):
    min_usage: int = Field(default=10, ge=1, description="Minimum usage count before a skill is eligible for retirement")
    max_success_rate: float = Field(default=0.3, ge=0.0, le=1.0, description="Success rate below which a skill is retired")


@router.post("/trigger", response_model=TriggerResponse)
async def trigger_evolution(body: TriggerRequest):
    """
    Analyze the most recent N sessions:
    1. Draft new SOULs for each agent (existing behaviour)
    2. Extract reusable Skill patterns from the full council conversation (new)

    All drafts are saved as pending and require /approve before activating.
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

    # ── Build transcripts: per-agent AND full-council ────────────────────
    agent_transcripts: dict[str, list[str]] = {
        aid: [] for aid in council._agents
    }
    full_transcripts: list[str] = []    # for skill extraction
    trigger_session_ids = [s.id for s in recent]

    for session in recent:
        try:
            full = await council.sessions.get(session.id)
        except Exception:
            continue
        if not full or not full.messages:
            continue

        # Full council transcript for skill extraction
        all_msgs = "\n".join(
            f"[{m.agent_name}]: {m.content}" for m in full.messages
        )
        full_transcripts.append(all_msgs)

        # Per-agent transcript for SOUL evolution
        for agent_id in council._agents:
            agent_msgs = [
                f"[{m.agent_name}]: {m.content}"
                for m in full.messages
                if m.agent_id == agent_id
            ]
            if agent_msgs:
                agent_transcripts[agent_id].append("\n".join(agent_msgs))

    # ── 1. SOUL evolution per agent ──────────────────────────────────────
    drafts = []
    for agent_id, agent in council._agents.items():
        transcripts = agent_transcripts.get(agent_id, [])
        if not transcripts:
            continue

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

    # ── 2. Skill extraction from full council transcripts ────────────────
    skills_extracted = 0
    if body.extract_skills and council.skills and full_transcripts:
        try:
            skill_drafts = await council.evolutor.extract_skills(
                session_transcripts=full_transcripts,
                source_session_ids=trigger_session_ids,
            )
            for sd in skill_drafts:
                # Generate embedding if memory/OpenAI available
                embedding = None
                if council.memory and hasattr(council.memory, "episodic"):
                    try:
                        embed_text = f"{sd.name}: {sd.description}\n\n{sd.template}"
                        embedding = await council.memory.episodic._embed(embed_text)
                    except Exception:
                        pass

                # Phase C: version chaining — if skill with same name exists, bump version
                parent_skill_id = None
                next_version = 1
                existing = await council.skills.get_by_name(sd.name)
                if existing:
                    parent_skill_id = existing.id
                    next_version = existing.version + 1
                    # Deprecate the old version so it's replaced by the new one
                    await council.skills.deprecate(existing.id)

                skill = await council.skills.create(
                    name=sd.name,
                    description=sd.description,
                    domain=sd.domain,
                    template=sd.template,
                    examples=sd.examples,
                    source_session_ids=sd.source_session_ids,
                    created_by_agent_id="evolutor",
                    embedding=embedding,
                    parent_skill_id=parent_skill_id,
                )

                # Phase C: auto-approve if configured
                if _AUTO_APPROVE_SKILLS:
                    await council.skills.approve(skill.id, approved_by="evolutor-auto")

                skills_extracted += 1
        except Exception as e:
            print(f"[evolution] Skill extraction failed: {e}")

    return TriggerResponse(
        drafts=drafts,
        sessions_analyzed=len(recent),
        agents_evolved=len(drafts),
        skills_extracted=skills_extracted,
    )


@router.post("/score-skills")
async def score_skill_usage(body: ScoreSkillsRequest):
    """
    Retroactively score unscored skill usage log entries.
    Fetches session transcripts for each entry and asks Evolutor to rate quality.
    Updates skill avg_quality_score and success_count after scoring.
    """
    if not council.evolutor:
        raise HTTPException(status_code=503, detail="Evolution engine not initialized")
    if not council.skills:
        raise HTTPException(status_code=503, detail="Skill store not available")

    unscored = await council.skills.get_unscored_usage(limit=body.limit)
    if not unscored:
        return {"scored": 0, "message": "No unscored usage entries"}

    scored = 0
    skill_ids_updated: set[str] = set()

    for entry in unscored:
        try:
            # Fetch session transcript for context
            full = await council.sessions.get(entry["session_id"])
            transcript = ""
            if full and full.messages:
                transcript = "\n".join(
                    f"[{m.agent_name}]: {m.content}" for m in full.messages
                )

            quality = await council.evolutor.score_skill_usage(
                skill_name=entry["skill_name"],
                skill_template=entry["skill_template"],
                session_transcript=transcript,
            )
            await council.skills.score_usage(entry["id"], quality)
            skill_ids_updated.add(entry["skill_id"])
            scored += 1
        except Exception as e:
            print(f"[evolution] Scoring failed for log {entry['id']}: {e}")

    # Recalculate aggregate stats for each affected skill
    await asyncio.gather(
        *[council.skills.update_avg_quality(sid) for sid in skill_ids_updated],
        return_exceptions=True,
    )

    return {
        "scored": scored,
        "skills_updated": list(skill_ids_updated),
    }


@router.post("/retire-skills")
async def retire_weak_skills(body: RetireSkillsRequest):
    """
    Phase C: Auto-retire skills that have been used enough times but consistently
    underperform. Condition: usage_count >= min_usage AND success_rate < max_success_rate.

    Safe to run on a schedule (e.g. daily cron). Deprecated skills are excluded from
    semantic search and injection but are kept in DB for audit / manual review.
    """
    if not council.skills:
        raise HTTPException(status_code=503, detail="Skill store not available")

    retired_ids = await council.skills.auto_retire_weak_skills(
        min_usage=body.min_usage,
        max_success_rate=body.max_success_rate,
    )
    return {
        "retired": len(retired_ids),
        "retired_skill_ids": retired_ids,
        "criteria": {
            "min_usage": body.min_usage,
            "max_success_rate": body.max_success_rate,
        },
    }


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
