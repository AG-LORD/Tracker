import logging

from google.auth.transport import requests
from google.oauth2 import id_token

from app.core.config import settings


logger = logging.getLogger(__name__)


def verify_google_id_token(credential: str) -> dict:
    try:
        token_info = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )

        logger.info(
            "Google token verified successfully. subject=%s audience=%s",
            token_info.get("sub"),
            token_info.get("aud"),
        )

        return token_info

    except ValueError as exc:
        logger.error("Google ID token verification failed: %s", exc)
        raise ValueError("Invalid Google ID token") from exc