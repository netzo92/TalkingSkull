"""FastAPI application entrypoint."""

from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .config import get_settings
from .livekit import build_join_token


class TokenRequest(BaseModel):
    """Request payload for LiveKit access tokens."""

    identity: str = Field(..., min_length=1)
    room: str = Field("talking-skull", min_length=1)


class TokenResponse(BaseModel):
    """Response body returned to LiveKit clients."""

    token: str
    url: str


def _parse_origins(origins: Optional[str]) -> List[str]:
    if not origins:
        return ["*"]
    return [origin.strip() for origin in origins.split(",") if origin.strip()]


settings = get_settings()
app = FastAPI(title="TalkingSkull Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_origins(settings.allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def healthcheck() -> dict[str, str]:
    """Simple healthcheck endpoint for monitoring."""

    return {"status": "ok"}


@app.post("/api/token", response_model=TokenResponse, tags=["livekit"])
def create_token(payload: TokenRequest) -> TokenResponse:
    """Generate a LiveKit access token for the requested room."""

    try:
        token = build_join_token(settings, payload.identity, payload.room)
    except Exception as exc:  # pragma: no cover - livekit library handles specifics
        raise HTTPException(status_code=500, detail="Unable to generate token") from exc

    return TokenResponse(token=token, url=str(settings.host))
