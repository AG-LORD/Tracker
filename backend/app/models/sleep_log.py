import uuid

from sqlalchemy import CheckConstraint, ForeignKey, Integer, SmallInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class SleepLog(Base):
    __tablename__ = "sleep_logs"

    __table_args__ = (
        CheckConstraint(
            "wake_count >= 0",
            name="ck_sleep_wake_count_non_negative",
        ),
        CheckConstraint(
            "quality >= 1 AND quality <= 5",
            name="ck_sleep_quality_range",
        ),
        CheckConstraint(
            "restedness >= 1 AND restedness <= 5",
            name="ck_sleep_restedness_range",
        ),
    )

    activity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activities.id", ondelete="CASCADE"),
        primary_key=True,
    )

    wake_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    quality: Mapped[int | None] = mapped_column(
        SmallInteger,
        nullable=True,
    )

    restedness: Mapped[int | None] = mapped_column(
        SmallInteger,
        nullable=True,
    )