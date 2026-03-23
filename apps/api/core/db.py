"""
Database connection pool management.
Uses asyncpg for PostgreSQL + pgvector.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

import asyncpg

from .config import settings

_pool: Optional[asyncpg.Pool] = None

# In Docker: /app/packages/orchestrator/migrations
# In dev: ../../../../packages/orchestrator/migrations
_POSSIBLE_MIGRATION_DIRS = [
    Path("/app/packages/orchestrator/migrations"),
    Path(__file__).parent.parent.parent.parent.parent / "packages" / "orchestrator" / "migrations",
]


def _find_migrations_dir() -> Optional[Path]:
    for d in _POSSIBLE_MIGRATION_DIRS:
        if d.exists():
            return d
    return None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            _pool = await asyncpg.create_pool(
                dsn=database_url,
                min_size=2,
                max_size=10,
            )
        else:
            _pool = await asyncpg.create_pool(
                host=settings.postgres_host,
                port=settings.postgres_port,
                database=settings.postgres_db,
                user=settings.postgres_user,
                password=settings.postgres_password,
                min_size=2,
                max_size=10,
            )
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def run_migrations(pool: asyncpg.Pool) -> None:
    """
    Run all SQL migration files in packages/orchestrator/migrations/
    in filename order. Each file is executed idempotently (uses IF NOT EXISTS).
    """
    migrations_dir = _find_migrations_dir()
    if not migrations_dir:
        print("[db] No migrations directory found, skipping")
        return

    migration_files = sorted(migrations_dir.glob("*.sql"))
    async with pool.acquire() as conn:
        for migration_file in migration_files:
            sql = migration_file.read_text(encoding="utf-8")
            try:
                await conn.execute(sql)
            except Exception as e:
                # Log but don't crash — some extensions may not be available
                print(f"[db] Migration warning ({migration_file.name}): {e}")
