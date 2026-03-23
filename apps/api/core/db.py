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

MIGRATIONS_DIR = Path(__file__).parent.parent.parent.parent.parent / "packages" / "orchestrator" / "migrations"


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
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
    if not MIGRATIONS_DIR.exists():
        return

    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    async with pool.acquire() as conn:
        for migration_file in migration_files:
            sql = migration_file.read_text(encoding="utf-8")
            try:
                await conn.execute(sql)
            except Exception as e:
                # Log but don't crash — some extensions may not be available
                print(f"[db] Migration warning ({migration_file.name}): {e}")
