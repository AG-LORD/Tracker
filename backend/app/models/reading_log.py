import uuid

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ReadingLog(Base):
    __tablename__ = "reading_logs"

    __table_args__ = (
        CheckConstraint(
            "pages_read >= 0",
            name="ck_reading_pages_non_negative",
        ),
    )

    activity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activities.id", ondelete="CASCADE"),
        primary_key=True,
    )

    book_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("books.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    pages_read: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    chapter: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    what_learned: Mapped[str | None] = mapped_column(
        String(2000),
        nullable=True,
    )