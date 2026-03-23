"""
/agents — Agent registry endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..core.council import council

router = APIRouter(prefix="/agents", tags=["agents"])


class AgentEvolutionRequest(BaseModel):
    feedback: str


@router.get("/")
async def list_agents():
    """List all registered council agents and their status."""
    return {"agents": council.list_agents()}


@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    """Get a specific agent's details."""
    agent = council.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
    return agent.to_dict()


@router.post("/{agent_id}/evolve")
async def evolve_agent(agent_id: str, body: AgentEvolutionRequest):
    """Feed evolution feedback to an agent (updates its system prompt strategy)."""
    agent = council.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
    await agent.evolve(body.feedback)
    return {"status": "evolved", "agent_id": agent_id}
