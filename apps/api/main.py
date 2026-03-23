from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Literal, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


app = FastAPI(title="AGORA API", version="0.1.0")


class TaskStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    WAITING_APPROVAL = "waiting_approval"
    REVIEW = "review"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELED = "canceled"


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    objective: str = Field(min_length=1, max_length=2000)
    repo_url: Optional[str] = None


class Workspace(BaseModel):
    workspace_id: str
    name: str
    objective: str
    repo_url: Optional[str] = None
    created_at: datetime


class SessionCreate(BaseModel):
    workspace_id: str
    mode: Literal["engineering", "research"] = "engineering"


class Session(BaseModel):
    session_id: str
    workspace_id: str
    mode: str
    created_at: datetime


class TaskCreate(BaseModel):
    session_id: str
    title: str = Field(min_length=1, max_length=200)
    prompt: str = Field(min_length=1, max_length=8000)
    agents: List[str] = Field(default_factory=lambda: ["claude", "codex"])
    requires_approval: bool = True


class Task(BaseModel):
    task_id: str
    session_id: str
    title: str
    prompt: str
    agents: List[str]
    status: TaskStatus
    created_at: datetime
    updated_at: datetime
    requires_approval: bool
    events: List[str] = Field(default_factory=list)


class TaskApproval(BaseModel):
    approved: bool
    reason: Optional[str] = None


class TaskEvent(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


workspaces: Dict[str, Workspace] = {}
sessions: Dict[str, Session] = {}
tasks: Dict[str, Task] = {}


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "agora-api",
        "version": "0.1.0",
        "time": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/v1/workspaces", response_model=Workspace)
def create_workspace(payload: WorkspaceCreate) -> Workspace:
    workspace = Workspace(
        workspace_id=str(uuid4()),
        name=payload.name,
        objective=payload.objective,
        repo_url=payload.repo_url,
        created_at=datetime.now(timezone.utc),
    )
    workspaces[workspace.workspace_id] = workspace
    return workspace


@app.get("/v1/workspaces/{workspace_id}", response_model=Workspace)
def get_workspace(workspace_id: str) -> Workspace:
    workspace = workspaces.get(workspace_id)
    if workspace is None:
        raise HTTPException(status_code=404, detail="workspace not found")
    return workspace


@app.post("/v1/sessions", response_model=Session)
def create_session(payload: SessionCreate) -> Session:
    if payload.workspace_id not in workspaces:
        raise HTTPException(status_code=404, detail="workspace not found")

    session = Session(
        session_id=str(uuid4()),
        workspace_id=payload.workspace_id,
        mode=payload.mode,
        created_at=datetime.now(timezone.utc),
    )
    sessions[session.session_id] = session
    return session


@app.get("/v1/sessions/{session_id}", response_model=Session)
def get_session(session_id: str) -> Session:
    session = sessions.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")
    return session


@app.post("/v1/tasks", response_model=Task)
def create_task(payload: TaskCreate) -> Task:
    if payload.session_id not in sessions:
        raise HTTPException(status_code=404, detail="session not found")

    now = datetime.now(timezone.utc)
    initial_status = TaskStatus.WAITING_APPROVAL if payload.requires_approval else TaskStatus.QUEUED

    task = Task(
        task_id=str(uuid4()),
        session_id=payload.session_id,
        title=payload.title,
        prompt=payload.prompt,
        agents=payload.agents,
        status=initial_status,
        created_at=now,
        updated_at=now,
        requires_approval=payload.requires_approval,
    )
    tasks[task.task_id] = task
    return task


@app.get("/v1/tasks/{task_id}", response_model=Task)
def get_task(task_id: str) -> Task:
    task = tasks.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="task not found")
    return task


@app.post("/v1/tasks/{task_id}/approve", response_model=Task)
def approve_task(task_id: str, payload: TaskApproval) -> Task:
    task = tasks.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="task not found")

    if task.status != TaskStatus.WAITING_APPROVAL:
        raise HTTPException(status_code=409, detail="task is not waiting approval")

    task.status = TaskStatus.QUEUED if payload.approved else TaskStatus.CANCELED
    task.events.append(f"approval: approved={payload.approved}, reason={payload.reason or 'n/a'}")
    task.updated_at = datetime.now(timezone.utc)
    tasks[task_id] = task
    return task


@app.post("/v1/tasks/{task_id}/events", response_model=Task)
def append_task_event(task_id: str, payload: TaskEvent) -> Task:
    task = tasks.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="task not found")

    task.events.append(payload.message)
    task.updated_at = datetime.now(timezone.utc)
    tasks[task_id] = task
    return task
