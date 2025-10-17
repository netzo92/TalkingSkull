"""LiveKit token helpers."""

from livekit import AccessToken, VideoGrants

from .config import Settings


def build_join_token(settings: Settings, identity: str, room: str) -> str:
    """Generate a room join token for the given identity."""

    grants = VideoGrants(room_join=True, room=room)
    token = AccessToken(
        settings.api_key,
        settings.api_secret,
        identity=identity,
        ttl=settings.token_ttl,
    )
    token.add_grant(grants)
    return token.to_jwt()
