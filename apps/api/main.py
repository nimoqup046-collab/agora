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
from .core.db import get_pool, close_pool, run_migrations
from .routers import agents, sessions, council as council_router, evolution as evolution_router, skills as skills_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: database pool → migrations → council
    try:
        pool = await get_pool()
        await run_migrations(pool)
        council.initialize(pool=pool)
        await council.load_latest_souls()
    except Exception as e:
        # Degrade gracefully: in-memory mode if DB unavailable
        print(f"[startup] DB unavailable ({e}), running in-memory mode")
        council.initialize(pool=None)
    yield
    # Shutdown
    await close_pool()


app = FastAPI(
    title="AGORA API",
    description="Multi-Agent Collective Intelligence Terminal — Backend API",
    version="0.2.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend and local dev
_cors_origins = [o.strip() for o in (settings.api_cors_origins or "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins or ["http://localhost:3000"],
    allow_origin_regex=r"https://.*\.(railway\.app|vercel\.app|onrender\.com)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(agents.router)
app.include_router(sessions.router)
app.include_router(council_router.router)
app.include_router(evolution_router.router)
app.include_router(skills_router.router)


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
        "version": "0.2.0",
        "docs": "/docs",
        "phase": "2 — Command Center",
    }
