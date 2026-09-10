import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ActivityCreate(BaseModel):
    activity_type_id: uuid.UUID
    title: str | None = None
    start_at: datetime
    end_at: datetime
    notes: str | None = None


class ActivityTypeSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    name: str


class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    activity_type_id: uuid.UUID
    title: str | None
    start_at: datetime
    end_at: datetime
    notes: str | None
    created_at: datetime
    updated_at: datetime
    activity_type: ActivityTypeSummary