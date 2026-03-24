-- Migration 004: Agent Skills table
-- Skills are reusable reasoning patterns extracted from sessions.
-- They are injected into agent context before think() for better consistency.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS agent_skills (
    id                  TEXT PRIMARY KEY,
    name                TEXT NOT NULL,
    description         TEXT NOT NULL,
    domain              TEXT NOT NULL,          -- "debugging"|"architecture"|"scientific"|"review"|"general"
    template            TEXT NOT NULL,          -- prompt fragment injected before think()
    examples            JSONB DEFAULT '[]',     -- [{input, output}] demonstration pairs
    embedding           vector(1536),           -- text-embedding-3-small for semantic retrieval
    agent_scope         TEXT[],                 -- NULL = shared across all agents
    source_session_ids  TEXT[] DEFAULT '{}',    -- sessions this skill was derived from
    created_by_agent_id TEXT DEFAULT 'human',   -- who created/extracted this skill
    usage_count         INTEGER DEFAULT 0,
    success_count       INTEGER DEFAULT 0,      -- times this skill received positive signal
    version             INTEGER DEFAULT 1,
    parent_skill_id     TEXT REFERENCES agent_skills(id) ON DELETE SET NULL,
    approved_at         TIMESTAMPTZ,            -- NULL = pending human review
    approved_by         TEXT,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- HNSW index for fast approximate nearest-neighbor search
CREATE INDEX IF NOT EXISTS idx_skills_embedding_hnsw
    ON agent_skills USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_skills_domain ON agent_skills (domain);
CREATE INDEX IF NOT EXISTS idx_skills_approved ON agent_skills (approved_at) WHERE approved_at IS NOT NULL;
