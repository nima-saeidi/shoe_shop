import enum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.product import ProductVariant
    from app.models.user import User


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class OrderType(str, enum.Enum):
    RETAIL = "retail"
    WHOLESALE = "wholesale"


class Order(TimestampMixin, Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_number: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_by_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)

    order_type: Mapped[OrderType] = mapped_column(Enum(OrderType, name="order_type"), default=OrderType.RETAIL)
    is_manual: Mapped[bool] = mapped_column(default=False)

    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus, name="order_status"), default=OrderStatus.PENDING)
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status"), default=PaymentStatus.PENDING
    )
    payment_method: Mapped[str] = mapped_column(String(30), default="cod")

    subtotal: Mapped[float] = mapped_column(Numeric(10, 2))
    discount_total: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    shipping_cost: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    grand_total: Mapped[float] = mapped_column(Numeric(10, 2))

    coupon_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    shipping_full_name: Mapped[str] = mapped_column(String(150))
    shipping_phone: Mapped[str] = mapped_column(String(20))
    shipping_address: Mapped[str] = mapped_column(String(500))
    shipping_city: Mapped[str] = mapped_column(String(100))
    shipping_postal_code: Mapped[str] = mapped_column(String(20))

    shipping_provider: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    tracking_code: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)

    notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    user: Mapped["User"] = relationship(back_populates="orders", foreign_keys=[user_id])
    created_by: Mapped[Optional["User"]] = relationship(foreign_keys=[created_by_id])
    items: Mapped[List["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")


class OrderItem(TimestampMixin, Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    variant_id: Mapped[int] = mapped_column(ForeignKey("product_variants.id"))

    product_name: Mapped[str] = mapped_column(String(200))
    size: Mapped[str] = mapped_column(String(10))
    color: Mapped[str] = mapped_column(String(40))
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2))
    quantity: Mapped[int] = mapped_column(default=1)

    order: Mapped["Order"] = relationship(back_populates="items")
    variant: Mapped["ProductVariant"] = relationship()

    @property
    def line_total(self) -> float:
        return float(self.unit_price) * self.quantity
