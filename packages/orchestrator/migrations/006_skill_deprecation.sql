-- Migration 006: Skill Deprecation & Phase C autonomous evolution support
-- Adds deprecated_at so weak skills can be automatically retired.

ALTER TABLE agent_skills ADD COLUMN IF NOT EXISTS deprecated_at TIMESTAMPTZ;
ALTER TABLE agent_skills ADD COLUMN IF NOT EXISTS avg_quality_score FLOAT;

CREATE INDEX IF NOT EXISTS idx_skills_deprecated
    ON agent_skills(deprecated_at)
    WHERE deprecated_at IS NOT NULL;

-- Active skills view: approved and not deprecated
CREATE OR REPLACE VIEW active_skills AS
    SELECT * FROM agent_skills
    WHERE approved_at IS NOT NULL
      AND deprecated_at IS NULL;
