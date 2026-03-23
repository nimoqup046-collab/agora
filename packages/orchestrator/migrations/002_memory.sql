-- AGORA Migration 002: Memory Embeddings (pgvector)
-- Requires pgvector extension (available in pgvector/pgvector:pg16 image).

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS memory_embeddings (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id   TEXT NOT NULL,
    agent_id     TEXT NOT NULL,
    content      TEXT NOT NULL,
    embedding    vector(1536),
    memory_type  TEXT NOT NULL DEFAULT 'episodic',
    importance   FLOAT NOT NULL DEFAULT 0.5,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata     JSONB NOT NULL DEFAULT '{}'
);

-- HNSW index for fast approximate nearest-neighbor search
CREATE INDEX IF NOT EXISTS idx_memory_embeddings_hnsw
    ON memory_embeddings
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_memory_embeddings_agent
    ON memory_embeddings(agent_id, importance DESC);

CREATE INDEX IF NOT EXISTS idx_memory_embeddings_session
    ON memory_embeddings(session_id);
