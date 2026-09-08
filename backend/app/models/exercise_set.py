import uuid

from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ExerciseSet(Base):
    __tablename__ = "exercise_sets"

    __table_args__ = (
        UniqueConstraint(
            "exercise_entry_id",
            "set_number",
            name="uq_exercise_set_number",
        ),
        CheckConstraint(
            "set_number > 0",
            name="ck_exercise_set_number_positive",
        ),
        CheckConstraint(
            "repetitions >= 0",
            name="ck_exercise_set_repetitions_non_negative",
        ),
        CheckConstraint(
            "weight_kg >= 0",
            name="ck_exercise_set_weight_non_negative",
        ),
        CheckConstraint(
            "duration_seconds >= 0",
            name="ck_exercise_set_duration_non_negative",
        ),
        CheckConstraint(
            "distance_km >= 0",
            name="ck_exercise_set_distance_non_negative",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    exercise_entry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("exercise_entries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    set_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    repetitions: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    weight_kg: Mapped[float | None] = mapped_column(
        Numeric(7, 2),
        nullable=True,
    )

    duration_seconds: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    distance_km: Mapped[float | None] = mapped_column(
        Numeric(8, 3),
        nullable=True,
    )

    set_type: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )