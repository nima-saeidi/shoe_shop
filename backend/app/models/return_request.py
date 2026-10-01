import enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.order import Order, OrderItem
    from app.models.user import User


class ReturnStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class ReturnReason(str, enum.Enum):
    WRONG_SIZE = "wrong_size"
    DEFECTIVE = "defective"
    NOT_AS_DESCRIBED = "not_as_described"
    CHANGED_MIND = "changed_mind"
    OTHER = "other"


class ReturnRequest(TimestampMixin, Base):
    __tablename__ = "return_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    order_item_id: Mapped[int] = mapped_column(ForeignKey("order_items.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    reason: Mapped[ReturnReason] = mapped_column(Enum(ReturnReason, name="return_reason"))
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[ReturnStatus] = mapped_column(Enum(ReturnStatus, name="return_status"), default=ReturnStatus.PENDING)
    admin_note: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    order: Mapped["Order"] = relationship()
    order_item: Mapped["OrderItem"] = relationship()
    user: Mapped["User"] = relationship()

    @property
    def order_number(self) -> str | None:
        return self.order.order_number if self.order else None

    @property
    def product_name(self) -> str | None:
        return self.order_item.product_name if self.order_item else None

    @property
    def size(self) -> str | None:
        return self.order_item.size if self.order_item else None

    @property
    def color(self) -> str | None:
        return self.order_item.color if self.order_item else None

    @property
    def customer_name(self) -> str | None:
        return self.user.full_name if self.user else None
