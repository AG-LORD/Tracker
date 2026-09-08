import uuid

from sqlalchemy import CheckConstraint, ForeignKey, Integer, SmallInteger, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ExerciseSession(Base):
    __tablename__ = "exercise_sessions"

    __table_args__ = (
        CheckConstraint(
            "overall_intensity >= 1 AND overall_intensity <= 5",
            name="ck_exercise_overall_intensity_range",
        ),
        CheckConstraint(
            "calories_estimated >= 0",
            name="ck_exercise_calories_non_negative",
        ),
    )

    activity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activities.id", ondelete="CASCADE"),
        primary_key=True,
    )

    location_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    overall_intensity: Mapped[int | None] = mapped_column(
        SmallInteger,
        nullable=True,
    )

    calories_estimated: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )