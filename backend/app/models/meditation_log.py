import uuid

from sqlalchemy import CheckConstraint, ForeignKey, SmallInteger, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class MeditationLog(Base):
    __tablename__ = "meditation_logs"

    __table_args__ = (
        CheckConstraint(
            "quality >= 1 AND quality <= 5",
            name="ck_meditation_quality_range",
        ),
    )

    activity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activities.id", ondelete="CASCADE"),
        primary_key=True,
    )

    meditation_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    quality: Mapped[int | None] = mapped_column(
        SmallInteger,
        nullable=True,
    )