import enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.order import Order
    from app.models.user import User


class WalletTxType(str, enum.Enum):
    TOPUP = "topup"
    DEDUCT = "deduct"
    REFUND = "refund"
    ORDER_PAYMENT = "order_payment"


class WalletTransaction(TimestampMixin, Base):
    __tablename__ = "wallet_transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    created_by_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    order_id: Mapped[Optional[int]] = mapped_column(ForeignKey("orders.id"), nullable=True)

    tx_type: Mapped[WalletTxType] = mapped_column(Enum(WalletTxType, name="wallet_tx_type"))
    amount: Mapped[float] = mapped_column(Numeric(12, 2))
    balance_after: Mapped[float] = mapped_column(Numeric(12, 2))
    description: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)

    user: Mapped["User"] = relationship(back_populates="wallet_transactions", foreign_keys=[user_id])
    created_by: Mapped[Optional["User"]] = relationship(foreign_keys=[created_by_id])
    order: Mapped[Optional["Order"]] = relationship()
