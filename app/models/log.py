import enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class LogLevel(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


class ActivityLog(TimestampMixin, Base):
    """Structured, queryable audit trail — who did what, when. Shown in the admin panel.

    For raw technical/error logs (tracebacks, uvicorn access logs), see the rotating
    file configured in app/core/logging_config.py instead.
    """

    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    level: Mapped[LogLevel] = mapped_column(Enum(LogLevel, name="log_level"), default=LogLevel.INFO, index=True)
    category: Mapped[str] = mapped_column(String(50), index=True)
    action: Mapped[str] = mapped_column(String(100))
    message: Mapped[str] = mapped_column(String(500))

    actor_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    actor_label: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)

    target_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    target_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)

    actor: Mapped[Optional["User"]] = relationship(foreign_keys=[actor_id])
