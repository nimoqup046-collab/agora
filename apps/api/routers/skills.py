"""
/skills — Agent Skill library endpoints.

GET    /skills/                  List all skills (with optional filters)
POST   /skills/                  Create a skill manually (pending approval)
GET    /skills/{skill_id}        Get skill detail
DELETE /skills/{skill_id}        Delete a skill
POST   /skills/{skill_id}/approve  Approve and activate a skill
POST   /skills/search            Semantic search for relevant skills
POST   /skills/{skill_id}/feedback  Record positive/negative feedback
"""

import sys
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

_PKG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "packages")
if os.path.isdir(_PKG_PATH) and _PKG_PATH not in sys.path:
    sys.path.insert(0, _PKG_PATH)

from ..core.council import council

router = APIRouter(prefix="/skills", tags=["skills"])


# ── Request / Response models ─────────────────────────────────────────────────

class CreateSkillRequest(BaseModel):
    name: str = Field(..., description="Short human-readable name")
    description: str = Field(..., description="What this skill does")
    domain: str = Field(..., description="e.g. architecture, debugging, scientific, review, general")
    template: str = Field(..., description="Prompt fragment injected before think(). Max 500 chars recommended.")
    examples: list[dict] = Field(default_factory=list, description="[{input, output}] demonstration pairs")
    agent_scope: Optional[list[str]] = Field(None, description="Agent IDs this skill applies to. null = all agents.")
    source_session_ids: list[str] = Field(default_factory=list)
    created_by_agent_id: str = Field("human")


class SearchSkillRequest(BaseModel):
    query: str = Field(..., description="Natural language query to find relevant skills")
    agent_id: Optional[str] = None
    limit: int = Field(default=3, ge=1, le=10)
    min_similarity: float = Field(default=0.5, ge=0.0, le=1.0)


class FeedbackRequest(BaseModel):
    positive: bool = Field(..., description="True = skill helped, False = skill hurt")


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_embedding(text: str) -> Optional[list[float]]:
    """Get embedding via the council's OpenAI client (reused from episodic memory)."""
    try:
        if council.memory and hasattr(council.memory, "episodic"):
            return await council.memory.episodic._embed(text[:8000])
    except Exception as e:
        print(f"[skills] Embedding failed: {e}")
    return None


def _skill_store():
    if not council.skills:
        raise HTTPException(status_code=503, detail="Skill store not available (no database)")
    return council.skills


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/")
async def list_skills(
    domain: Optional[str] = None,
    agent_id: Optional[str] = None,
    approved_only: bool = False,
    include_deprecated: bool = False,
    limit: int = 50,
):
    """List skills with optional domain/agent filters. Excludes deprecated by default."""
    store = _skill_store()
    skills = await store.list_all(
        domain=domain,
        agent_id=agent_id,
        approved_only=approved_only,
        include_deprecated=include_deprecated,
        limit=limit,
    )
    return {"skills": [s.to_dict() for s in skills], "total": len(skills)}


@router.post("/")
async def create_skill(body: CreateSkillRequest):
    """
    Manually create a skill. Starts as pending (not approved).
    Embedding is generated automatically from description + template.
    """
    store = _skill_store()

    # Generate embedding for semantic retrieval
    embed_text = f"{body.name}: {body.description}\n\n{body.template}"
    embedding = await _get_embedding(embed_text)

    skill = await store.create(
        name=body.name,
        description=body.description,
        domain=body.domain,
        template=body.template,
        examples=body.examples,
        agent_scope=body.agent_scope,
        source_session_ids=body.source_session_ids,
        created_by_agent_id=body.created_by_agent_id,
        embedding=embedding,
    )
    return {
        "skill": skill.to_dict(),
        "embedded": embedding is not None,
    }


@router.get("/{skill_id}")
async def get_skill(skill_id: str):
    store = _skill_store()
    skill = await store.get_by_id(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_id}' not found")
    return {"skill": skill.to_dict()}


@router.delete("/{skill_id}")
async def delete_skill(skill_id: str):
    store = _skill_store()
    deleted = await store.delete(skill_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_id}' not found")
    return {"deleted": True, "skill_id": skill_id}


@router.post("/{skill_id}/approve")
async def approve_skill(skill_id: str, approved_by: str = "human"):
    """Approve a pending skill, making it eligible for retrieval."""
    store = _skill_store()
    skill = await store.approve(skill_id, approved_by=approved_by)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_id}' not found")
    return {"skill": skill.to_dict(), "activated": True}


@router.post("/search")
async def search_skills(body: SearchSkillRequest):
    """
    Semantic search for skills relevant to a query.
    Returns only approved skills with embedding.
    Requires OpenAI API key for embedding generation.
    """
    store = _skill_store()

    embedding = await _get_embedding(body.query)
    if not embedding:
        raise HTTPException(
            status_code=503,
            detail="Embedding unavailable — OpenAI API key required for skill search"
        )

    results = await store.search(
        query_embedding=embedding,
        agent_id=body.agent_id,
        limit=body.limit,
        min_similarity=body.min_similarity,
    )
    return {
        "results": [
            {"skill": r.skill.to_dict(), "similarity": round(r.similarity, 4)}
            for r in results
        ],
        "query": body.query,
    }


@router.post("/{skill_id}/feedback")
async def record_feedback(skill_id: str, body: FeedbackRequest):
    """Record feedback signal for a skill (positive → increments success_count)."""
    store = _skill_store()
    skill = await store.get_by_id(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_id}' not found")

    await store.increment_usage(skill_id)
    if body.positive:
        await store.increment_success(skill_id)

    return {"recorded": True, "positive": body.positive, "skill_id": skill_id}


@router.post("/{skill_id}/deprecate")
async def deprecate_skill(skill_id: str):
    """
    Phase C: Manually deprecate a skill (soft-delete).
    Deprecated skills are excluded from search and injection but kept in DB.
    Use DELETE for hard deletion.
    """
    store = _skill_store()
    skill = await store.deprecate(skill_id)
    if not skill:
        raise HTTPException(
            status_code=404,
            detail=f"Skill '{skill_id}' not found or already deprecated"
        )
    return {"deprecated": True, "skill": skill.to_dict()}
