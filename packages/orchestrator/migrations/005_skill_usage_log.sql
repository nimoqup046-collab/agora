-- Migration 005: Skill Usage Audit Log
-- Tracks every time a skill is injected into an agent's context,
-- enabling the Evolutor to score skill effectiveness retroactively.

CREATE TABLE IF NOT EXISTS skill_usage_log (
    id              TEXT PRIMARY KEY,
    skill_id        TEXT NOT NULL REFERENCES agent_skills(id) ON DELETE CASCADE,
    session_id      TEXT NOT NULL,
    agent_id        TEXT NOT NULL,
    query_text      TEXT NOT NULL,          -- user message that triggered skill retrieval
    similarity_score FLOAT NOT NULL,        -- cosine similarity at retrieval time
    outcome_quality FLOAT,                  -- set retroactively by Evolutor (0.0-1.0), NULL until scored
    injected_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_usage_skill      ON skill_usage_log(skill_id, injected_at DESC);
CREATE INDEX IF NOT EXISTS idx_skill_usage_session    ON skill_usage_log(session_id);
CREATE INDEX IF NOT EXISTS idx_skill_usage_unscored   ON skill_usage_log(injected_at DESC) WHERE outcome_quality IS NULL;
