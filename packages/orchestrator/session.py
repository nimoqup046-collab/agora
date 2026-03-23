"""
Session — A council work session.

Tracks all messages, participants, task context, and state
for a single collaborative problem-solving session.
"""

from __future__ import annotations

import enum
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


class SessionStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class SessionMessage:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    agent_id: str = ""
    agent_name: str = ""
    content: str = ""
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata,
        }


@dataclass
class Session:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    title: str = "Untitled Session"
    task: str = ""
    status: SessionStatus = SessionStatus.PENDING
    messages: list[SessionMessage] = field(default_factory=list)
    participant_ids: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict = field(default_factory=dict)

    def add_message(
        self,
        agent_id: str,
        agent_name: str,
        content: str,
        metadata: Optional[dict] = None,
    ) -> SessionMessage:
        msg = SessionMessage(
            agent_id=agent_id,
            agent_name=agent_name,
            content=content,
            metadata=metadata or {},
        )
        self.messages.append(msg)
        self.updated_at = datetime.now(timezone.utc)
        return msg

    def get_history_for_agent(self, agent_id: str, max_messages: int = 50) -> list[dict]:
        """
        Return conversation history formatted for LLM API consumption.
        Frames messages from the given agent as 'assistant', others as 'user'.
        """
        history = []
        for msg in self.messages[-max_messages:]:
            role = "assistant" if msg.agent_id == agent_id else "user"
            label = f"[{msg.agent_name}]: " if msg.agent_id != agent_id else ""
            history.append({"role": role, "content": f"{label}{msg.content}"})
        return history

    def get_full_context(self) -> str:
        """Render all messages as a readable transcript."""
        lines = [f"Session: {self.title}", f"Task: {self.task}", "---"]
        for msg in self.messages:
            ts = msg.timestamp.strftime("%H:%M:%S")
            lines.append(f"[{ts}] {msg.agent_name}: {msg.content}")
        return "\n".join(lines)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "task": self.task,
            "status": self.status.value,
            "message_count": len(self.messages),
            "participant_ids": self.participant_ids,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "metadata": self.metadata,
        }


class SessionStore:
    """
    In-memory session store for Phase 1.
    Will be replaced with Redis + PostgreSQL in Phase 2.
    """

    def __init__(self):
        self._sessions: dict[str, Session] = {}

    def create(self, title: str, task: str, participant_ids: list[str]) -> Session:
        session = Session(
            title=title,
            task=task,
            participant_ids=participant_ids,
            status=SessionStatus.ACTIVE,
        )
        self._sessions[session.id] = session
        return session

    def get(self, session_id: str) -> Optional[Session]:
        return self._sessions.get(session_id)

    def list_all(self) -> list[Session]:
        return list(self._sessions.values())

    def update_status(self, session_id: str, status: SessionStatus) -> bool:
        session = self._sessions.get(session_id)
        if not session:
            return False
        session.status = status
        session.updated_at = datetime.now(timezone.utc)
        return True

    def delete(self, session_id: str) -> bool:
        return self._sessions.pop(session_id, None) is not None
