import uuid

from pydantic import BaseModel


class GoogleLoginRequest(BaseModel):
    credential: str

class AuthUserResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    profile_image_url: str | None
    timezone: str