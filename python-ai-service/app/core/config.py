"""Application configuration using Pydantic Settings."""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "NewsLingua AI Service"
    version: str = "0.1.0"
    debug: bool = False
    port: int = 8000

    # CORS
    cors_origins: List[str] = ["http://localhost:3000"]

    # Anthropic (Claude)
    anthropic_api_key: str = ""

    # OpenAI (fallback)
    openai_api_key: str = ""

    # Redis (optional caching)
    redis_url: str = "redis://localhost:6379"

    # JWT Secret (shared with Next.js)
    jwt_secret: str = ""

    @property
    def has_anthropic(self) -> bool:
        """Check if Anthropic API key is configured."""
        return bool(self.anthropic_api_key)

    @property
    def has_openai(self) -> bool:
        """Check if OpenAI API key is configured."""
        return bool(self.openai_api_key)


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
