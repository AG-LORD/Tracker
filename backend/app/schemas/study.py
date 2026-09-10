import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class StudySubjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class StudySubjectResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    is_active: bool
    created_at: datetime


class StudySessionCreate(BaseModel):
    subject_id: uuid.UUID
    title: str | None = None
    start_at: datetime
    end_at: datetime
    topic: str | None = None
    problems_solved: int = Field(default=0, ge=0)
    confidence: int | None = Field(default=None, ge=1, le=5)
    what_studied: str | None = None
    what_struggled: str | None = None
    what_learned: str | None = None


class StudySessionResponse(BaseModel):
    activity_id: uuid.UUID
    subject_id: uuid.UUID

    title: str | None
    start_at: datetime
    end_at: datetime

    topic: str | None
    problems_solved: int
    confidence: int | None
    what_studied: str | None
    what_struggled: str | None
    what_learned: str | None