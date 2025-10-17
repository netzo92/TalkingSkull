"""Application configuration helpers."""

from functools import lru_cache
from typing import Optional

from pydantic import Field, HttpUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables."""

    api_key: str = Field(..., alias="LIVEKIT_API_KEY")
    api_secret: str = Field(..., alias="LIVEKIT_API_SECRET")
    host: HttpUrl = Field(..., alias="LIVEKIT_HOST")
    token_ttl: int = Field(3600, alias="LIVEKIT_TOKEN_TTL", ge=60)
    allowed_origins: Optional[str] = Field(None, alias="CORS_ALLOWED_ORIGINS")

    class Config:
        case_sensitive = True


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached application settings."""

    return Settings()  # type: ignore[arg-type]
