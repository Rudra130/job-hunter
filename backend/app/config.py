import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "JobPilot AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = Field(default="jobpilot-super-secret-production-key-change-in-env-32bytes", env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./jobpilot.db",
        env="DATABASE_URL",
        description="PostgreSQL URL (e.g. postgresql://user:pass@localhost:5432/jobpilot) or SQLite for zero-config local run"
    )

    # Redis (Optional in local dev, in-memory mock queue if Redis unreachable)
    REDIS_URL: Optional[str] = Field(default="redis://localhost:6379/0", env="REDIS_URL")

    # AI Configuration (NVIDIA NIM, OpenAI, Anthropic, or Ollama compatible)
    OPENAI_API_KEY: Optional[str] = Field(default="", env="OPENAI_API_KEY")
    OPENAI_BASE_URL: Optional[str] = Field(
        default="https://integrate.api.nvidia.com/v1",
        env="OPENAI_BASE_URL",
        description="NVIDIA NIM URL or OpenAI endpoint URL"
    )
    LLM_MODEL: str = Field(default="meta/llama-3.1-70b-instruct", env="LLM_MODEL")
    EMBEDDING_MODEL: str = Field(default="nvidia/nv-embed-v1", env="EMBEDDING_MODEL")

    # Mock mode allows instant UI testing without requiring external LLM or DB keys
    MOCK_AI_RESPONSES: bool = Field(default=True, env="MOCK_AI_RESPONSES")

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://jobpilot.vercel.app",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
