"""
/sessions — Council session lifecycle endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..core.council import council
from ..core.config import settings

import sys, os
_PKG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "packages")
if os.path.isdir(_PKG_PATH) and _PKG_PATH not in sys.path:
    sys.path.insert(0, _PKG_PATH)
from orchestrator.session import SessionStatus

router = APIRouter(prefix="/sessions", tags=["sessions"])

DEFAULT_PARTICIPANTS = ["claude-architect", "codex-implementer", "meta-conductor"]


class CreateSessionRequest(BaseModel):
    title: str = "Council Session"
    task: str
    participant_ids: list[str] = DEFAULT_PARTICIPANTS


class UpdateSessionRequest(BaseModel):
    status: SessionStatus


@router.post("/")
async def create_session(body: CreateSessionRequest):
    """Create a new council session."""
    # Validate participants exist
    for aid in body.participant_ids:
        if not council.get_agent(aid):
            raise HTTPException(status_code=400, detail=f"Unknown agent: {aid}")

    session = council.sessions.create(
        title=body.title,
        task=body.task,
        participant_ids=body.participant_ids,
    )
    return session.to_dict()


@router.get("/")
async def list_sessions():
    """List all sessions."""
    return {"sessions": [s.to_dict() for s in council.sessions.list_all()]}


@router.get("/{session_id}")
async def get_session(session_id: str):
    """Get a session with its full message history."""
    session = council.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    data = session.to_dict()
    data["messages"] = [m.to_dict() for m in session.messages]
    return data


@router.patch("/{session_id}")
async def update_session_status(session_id: str, body: UpdateSessionRequest):
    """Update session status (pause, complete, etc.)."""
    ok = council.sessions.update_status(session_id, body.status)
    if not ok:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "updated", "session_id": session_id, "new_status": body.status.value}


@router.delete("/{session_id}")
async def delete_session(session_id: str):
    """Delete a session."""
    ok = council.sessions.delete(session_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "deleted", "session_id": session_id}
