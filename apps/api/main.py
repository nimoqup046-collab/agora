"""
AGORA API — Entry point.

FastAPI application with:
- /health       — liveness check
- /agents       — agent registry
- /sessions     — session lifecycle
- /council      — multi-agent collaboration (with SSE streaming)
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.council import council
from .routers import agents, sessions, council as council_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize the agent council
    council.initialize()
    yield
    # Shutdown: nothing to clean up in Phase 1 (in-memory)


app = FastAPI(
    title="AGORA API",
    description="Multi-Agent Collective Intelligence Terminal — Backend API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.railway.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(agents.router)
app.include_router(sessions.router)
app.include_router(council_router.router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "app": settings.app_name,
        "agents": len(council.list_agents()),
    }


@app.get("/")
async def root():
    return {
        "name": "AGORA API",
        "version": "0.1.0",
        "docs": "/docs",
        "phase": "1 — Council MVP",
    }
