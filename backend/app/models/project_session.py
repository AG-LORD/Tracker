import uuid

from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ProjectSession(Base):
    __tablename__ = "project_sessions"

    activity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activities.id", ondelete="CASCADE"),
        primary_key=True,
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    work_done: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    problems_faced: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    learnings: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    next_step: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )