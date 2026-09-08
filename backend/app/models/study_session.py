import uuid

from sqlalchemy import ForeignKey, Integer, SmallInteger, String, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    __table_args__ = (
        CheckConstraint(
            "problems_solved >= 0",
            name="ck_study_problems_solved_non_negative",
        ),
        CheckConstraint(
            "confidence >= 1 AND confidence <= 5",
            name="ck_study_confidence_range",
        ),
    )

    activity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activities.id", ondelete="CASCADE"),
        primary_key=True,
    )

    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("study_subjects.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    topic: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    problems_solved: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    confidence: Mapped[int | None] = mapped_column(
        SmallInteger,
        nullable=True,
    )

    what_studied: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    what_struggled: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    what_learned: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )