import enum
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, Enum, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.address import Address
    from app.models.cart import Cart
    from app.models.order import Order
    from app.models.review import Review
    from app.models.support import SupportTicket
    from app.models.wallet import WalletTransaction


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    WHOLESALE = "wholesale"
    ADMIN = "admin"
    SUPERADMIN = "superadmin"


class WholesaleStatus(str, enum.Enum):
    NONE = "none"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(150))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone_number: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), default=UserRole.CUSTOMER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    company_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    wholesale_status: Mapped[WholesaleStatus] = mapped_column(
        Enum(WholesaleStatus, name="wholesale_status"), default=WholesaleStatus.NONE
    )
    wholesale_requested_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    wallet_balance: Mapped[float] = mapped_column(Numeric(12, 2), default=0)

    addresses: Mapped[List["Address"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    cart: Mapped["Cart"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    orders: Mapped[List["Order"]] = relationship(back_populates="user", foreign_keys="Order.user_id")
    reviews: Mapped[List["Review"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    wallet_transactions: Mapped[List["WalletTransaction"]] = relationship(
        back_populates="user", foreign_keys="WalletTransaction.user_id", cascade="all, delete-orphan"
    )
    tickets: Mapped[List["SupportTicket"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    @property
    def is_admin(self) -> bool:
        return self.role in (UserRole.ADMIN, UserRole.SUPERADMIN)

    @property
    def is_wholesale(self) -> bool:
        return self.role == UserRole.WHOLESALE and self.wholesale_status == WholesaleStatus.APPROVED
