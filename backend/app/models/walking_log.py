import uuid

from sqlalchemy import CheckConstraint, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class WalkingLog(Base):
    __tablename__ = "walking_logs"

    __table_args__ = (
        CheckConstraint(
            "distance_km >= 0",
            name="ck_walking_distance_non_negative",
        ),
        CheckConstraint(
            "steps >= 0",
            name="ck_walking_steps_non_negative",
        ),
        CheckConstraint(
            "pace_seconds_per_km >= 0",
            name="ck_walking_pace_non_negative",
        ),
        CheckConstraint(
            "calories_estimated >= 0",
            name="ck_walking_calories_non_negative",
        ),
    )

    activity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activities.id", ondelete="CASCADE"),
        primary_key=True,
    )

    activity_kind: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    distance_km: Mapped[float] = mapped_column(
        Numeric(8, 3),
        nullable=False,
    )

    steps: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    steps_source: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    pace_seconds_per_km: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    calories_estimated: Mapped[float | None] = mapped_column(
        Numeric(8, 2),
        nullable=True,
    )