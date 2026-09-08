import uuid

from sqlalchemy import ForeignKey, Integer, Numeric, String, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class CardioEntry(Base):
    __tablename__ = "cardio_entries"

    __table_args__ = (
        CheckConstraint(
            "duration_seconds > 0",
            name="ck_cardio_duration_positive",
        ),
        CheckConstraint(
            "distance_km >= 0",
            name="ck_cardio_distance_non_negative",
        ),
        CheckConstraint(
            "calories_estimated >= 0",
            name="ck_cardio_calories_non_negative",
        ),
        CheckConstraint(
            "incline_percent >= 0",
            name="ck_cardio_incline_non_negative",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    exercise_session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("exercise_sessions.activity_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    cardio_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    duration_seconds: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    distance_km: Mapped[float | None] = mapped_column(
        Numeric(8, 3),
        nullable=True,
    )

    calories_estimated: Mapped[float | None] = mapped_column(
        Numeric(8, 2),
        nullable=True,
    )

    average_speed_kmh: Mapped[float | None] = mapped_column(
        Numeric(6, 2),
        nullable=True,
    )

    incline_percent: Mapped[float | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )