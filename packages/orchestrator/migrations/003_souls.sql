-- AGORA Migration 003: Agent Souls (Evolution Engine)
-- Idempotent — safe to run multiple times.

CREATE TABLE IF NOT EXISTS agent_souls (
    id              TEXT PRIMARY KEY,
    agent_id        TEXT NOT NULL,
    version         INTEGER NOT NULL,
    soul_content    TEXT NOT NULL,
    delta_summary   TEXT NOT NULL DEFAULT '',
    trigger_session_ids TEXT[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_at     TIMESTAMPTZ,
    approved_by     TEXT
);

CREATE INDEX IF NOT EXISTS idx_agent_souls_agent
    ON agent_souls(agent_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_agent_souls_pending
    ON agent_souls(agent_id) WHERE approved_at IS NULL;
