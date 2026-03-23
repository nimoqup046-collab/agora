"""
AGORA API Configuration
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "AGORA API"
    debug: bool = False
    log_level: str = "INFO"

    # API Keys
    anthropic_api_key: str = ""
    openai_api_key: str = ""

    # Database
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "agora"
    postgres_user: str = "agora"
    postgres_password: str = "changeme_in_production"

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str = ""

    # Neo4j (Phase 2)
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "changeme_in_production"

    # GitHub (Phase 1 - PR automation)
    github_token: str = ""
    github_default_owner: str = ""
    github_default_repo: str = ""

    # Council defaults
    default_model_claude: str = "claude-opus-4-6"
    default_model_codex: str = "gpt-4o"
    max_turns_per_session: int = 20
    session_timeout_seconds: int = 3600

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
