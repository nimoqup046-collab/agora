import json
import os
from datetime import datetime, timezone
from enum import Enum
from typing import List, Literal, Optional
from uuid import uuid4

import psycopg
import redis
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from psycopg.rows import dict_row


def _build_database_url() -> str:
    explicit = os.getenv("DATABASE_URL")
    if explicit:
        return explicit

    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db_name = os.getenv("POSTGRES_DB", "agora")
    user = os.getenv("POSTGRES_USER", "agora")
    password = os.getenv("POSTGRES_PASSWORD", "changeme_in_production")
    return f"postgresql://{user}:{password}@{host}:{port}/{db_name}"


DATABASE_URL = _build_database_url()
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
REDIS_TASK_STATUS_KEY = "agora:task_status"

redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
app = FastAPI(title="AGORA API", version="0.2.0")

cors_origins = [origin.strip() for origin in os.getenv("API_CORS_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


def _get_conn() -> psycopg.Connection:
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)


def _init_db_schema() -> None:
    with _get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS workspaces (
                  workspace_id TEXT PRIMARY KEY,
                  name TEXT NOT NULL,
                  objective TEXT NOT NULL,
                  repo_url TEXT,
                  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS sessions (
                  session_id TEXT PRIMARY KEY,
                  workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
                  mode TEXT NOT NULL,
                  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS tasks (
                  task_id TEXT PRIMARY KEY,
                  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
                  title TEXT NOT NULL,
                  prompt TEXT NOT NULL,
                  agents JSONB NOT NULL DEFAULT '[]'::jsonb,
                  status TEXT NOT NULL,
                  requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
                  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS task_events (
                  event_id BIGSERIAL PRIMARY KEY,
                  task_id TEXT NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
                  message TEXT NOT NULL,
                  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                """
            )
            cur.execute("CREATE INDEX IF NOT EXISTS idx_sessions_workspace ON sessions(workspace_id);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_tasks_session ON tasks(session_id);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_events_task ON task_events(task_id);")
        conn.commit()


@app.on_event("startup")
def startup() -> None:
    _init_db_schema()


def _task_events(conn: psycopg.Connection, task_id: str) -> List[str]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT message
            FROM task_events
            WHERE task_id = %s
            ORDER BY event_id ASC;
            """,
            (task_id,),
        )
        return [row["message"] for row in cur.fetchall()]


def _row_to_task(conn: psycopg.Connection, row: dict) -> Task:
    return Task(
        task_id=row["task_id"],
        session_id=row["session_id"],
        title=row["title"],
        prompt=row["prompt"],
        agents=list(row["agents"] or []),
        status=TaskStatus(row["status"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        requires_approval=row["requires_approval"],
        events=_task_events(conn, row["task_id"]),
    )


def _cache_task_status(task_id: str, status: TaskStatus) -> None:
    try:
        redis_client.hset(REDIS_TASK_STATUS_KEY, task_id, status.value)
    except Exception:
        pass


@app.get("/health")
def health() -> dict:
    db_ok = True
    redis_ok = True

    try:
        with _get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1;")
                _ = cur.fetchone()
    except Exception:
        db_ok = False

    try:
        redis_client.ping()
    except Exception:
        redis_ok = False

    status = "ok" if db_ok and redis_ok else "degraded"
    return {
        "status": status,
        "service": "agora-api",
        "version": "0.2.0",
        "time": datetime.now(timezone.utc).isoformat(),
        "checks": {"postgres": db_ok, "redis": redis_ok},
    }


@app.post("/v1/workspaces", response_model=Workspace)
def create_workspace(payload: WorkspaceCreate) -> Workspace:
    workspace_id = str(uuid4())
    with _get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO workspaces (workspace_id, name, objective, repo_url)
                VALUES (%s, %s, %s, %s)
                RETURNING workspace_id, name, objective, repo_url, created_at;
                """,
                (workspace_id, payload.name, payload.objective, payload.repo_url),
            )
            row = cur.fetchone()
        conn.commit()
    return Workspace(**row)


@app.get("/v1/workspaces", response_model=List[Workspace])
def list_workspaces(limit: int = Query(default=50, ge=1, le=200)) -> List[Workspace]:
    with _get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT workspace_id, name, objective, repo_url, created_at
                FROM workspaces
                ORDER BY created_at DESC
                LIMIT %s;
                """,
                (limit,),
            )
            rows = cur.fetchall()
    return [Workspace(**row) for row in rows]


@app.get("/v1/workspaces/{workspace_id}", response_model=Workspace)
def get_workspace(workspace_id: str) -> Workspace:
    with _get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT workspace_id, name, objective, repo_url, created_at
                FROM workspaces
                WHERE workspace_id = %s;
                """,
                (workspace_id,),
            )
            row = cur.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="workspace not found")
    return Workspace(**row)


@app.post("/v1/sessions", response_model=Session)
def create_session(payload: SessionCreate) -> Session:
    session_id = str(uuid4())
    with _get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM workspaces WHERE workspace_id = %s;", (payload.workspace_id,))
            if cur.fetchone() is None:
                raise HTTPException(status_code=404, detail="workspace not found")

            cur.execute(
                """
                INSERT INTO sessions (session_id, workspace_id, mode)
                VALUES (%s, %s, %s)
                RETURNING session_id, workspace_id, mode, created_at;
                """,
                (session_id, payload.workspace_id, payload.mode),
            )
            row = cur.fetchone()
        conn.commit()
    return Session(**row)


@app.get("/v1/sessions", response_model=List[Session])
def list_sessions(
    workspace_id: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
) -> List[Session]:
    with _get_conn() as conn:
        with conn.cursor() as cur:
            if workspace_id:
                cur.execute(
                    """
                    SELECT session_id, workspace_id, mode, created_at
                    FROM sessions
                    WHERE workspace_id = %s
                    ORDER BY created_at DESC
                    LIMIT %s;
                    """,
                    (workspace_id, limit),
                )
            else:
                cur.execute(
                    """
                    SELECT session_id, workspace_id, mode, created_at
                    FROM sessions
                    ORDER BY created_at DESC
                    LIMIT %s;
                    """,
                    (limit,),
                )
            rows = cur.fetchall()
    return [Session(**row) for row in rows]


@app.get("/v1/sessions/{session_id}", response_model=Session)
def get_session(session_id: str) -> Session:
    with _get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT session_id, workspace_id, mode, created_at
                FROM sessions
                WHERE session_id = %s;
                """,
                (session_id,),
            )
            row = cur.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="session not found")
    return Session(**row)


@app.post("/v1/tasks", response_model=Task)
def create_task(payload: TaskCreate) -> Task:
    task_id = str(uuid4())
    initial_status = TaskStatus.WAITING_APPROVAL if payload.requires_approval else TaskStatus.QUEUED
    agents = payload.agents or ["claude", "codex"]

    with _get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM sessions WHERE session_id = %s;", (payload.session_id,))
            if cur.fetchone() is None:
                raise HTTPException(status_code=404, detail="session not found")

            cur.execute(
                """
                INSERT INTO tasks (task_id, session_id, title, prompt, agents, status, requires_approval)
                VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s)
                RETURNING task_id, session_id, title, prompt, agents, status, requires_approval, created_at, updated_at;
                """,
                (
                    task_id,
                    payload.session_id,
                    payload.title,
                    payload.prompt,
                    json.dumps(agents),
                    initial_status.value,
                    payload.requires_approval,
                ),
            )
            row = cur.fetchone()
        conn.commit()

    _cache_task_status(task_id, initial_status)
    with _get_conn() as conn:
        return _row_to_task(conn, row)


@app.get("/v1/tasks", response_model=List[Task])
def list_tasks(
    session_id: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
) -> List[Task]:
    with _get_conn() as conn:
        with conn.cursor() as cur:
            if session_id:
                cur.execute(
                    """
                    SELECT task_id, session_id, title, prompt, agents, status, requires_approval, created_at, updated_at
                    FROM tasks
                    WHERE session_id = %s
                    ORDER BY created_at DESC
                    LIMIT %s;
                    """,
                    (session_id, limit),
                )
            else:
                cur.execute(
                    """
                    SELECT task_id, session_id, title, prompt, agents, status, requires_approval, created_at, updated_at
                    FROM tasks
                    ORDER BY created_at DESC
                    LIMIT %s;
                    """,
                    (limit,),
                )
            rows = cur.fetchall()
        return [_row_to_task(conn, row) for row in rows]


@app.get("/v1/tasks/{task_id}", response_model=Task)
def get_task(task_id: str) -> Task:
    with _get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT task_id, session_id, title, prompt, agents, status, requires_approval, created_at, updated_at
                FROM tasks
                WHERE task_id = %s;
                """,
                (task_id,),
            )
            row = cur.fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="task not found")
        return _row_to_task(conn, row)


@app.post("/v1/tasks/{task_id}/approve", response_model=Task)
def approve_task(task_id: str, payload: TaskApproval) -> Task:
    with _get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT task_id, session_id, title, prompt, agents, status, requires_approval, created_at, updated_at
                FROM tasks
                WHERE task_id = %s
                FOR UPDATE;
                """,
                (task_id,),
            )
            row = cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="task not found")

            if row["status"] != TaskStatus.WAITING_APPROVAL.value:
                raise HTTPException(status_code=409, detail="task is not waiting approval")

            next_status = TaskStatus.QUEUED if payload.approved else TaskStatus.CANCELED
            cur.execute(
                """
                UPDATE tasks
                SET status = %s, updated_at = NOW()
                WHERE task_id = %s;
                """,
                (next_status.value, task_id),
            )
            cur.execute(
                """
                INSERT INTO task_events (task_id, message)
                VALUES (%s, %s);
                """,
                (task_id, f"approval: approved={payload.approved}, reason={payload.reason or 'n/a'}"),
            )
            cur.execute(
                """
                SELECT task_id, session_id, title, prompt, agents, status, requires_approval, created_at, updated_at
                FROM tasks
                WHERE task_id = %s;
                """,
                (task_id,),
            )
            updated_row = cur.fetchone()
        conn.commit()

        _cache_task_status(task_id, next_status)
        return _row_to_task(conn, updated_row)


@app.post("/v1/tasks/{task_id}/events", response_model=Task)
def append_task_event(task_id: str, payload: TaskEvent) -> Task:
    with _get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM tasks WHERE task_id = %s;", (task_id,))
            if cur.fetchone() is None:
                raise HTTPException(status_code=404, detail="task not found")

            cur.execute(
                """
                INSERT INTO task_events (task_id, message)
                VALUES (%s, %s);
                """,
                (task_id, payload.message),
            )
            cur.execute(
                """
                UPDATE tasks
                SET updated_at = NOW()
                WHERE task_id = %s;
                """,
                (task_id,),
            )
            cur.execute(
                """
                SELECT task_id, session_id, title, prompt, agents, status, requires_approval, created_at, updated_at
                FROM tasks
                WHERE task_id = %s;
                """,
                (task_id,),
            )
            row = cur.fetchone()
        conn.commit()
        return _row_to_task(conn, row)
