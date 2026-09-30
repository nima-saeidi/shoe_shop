from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError
from app.models.log import LogLevel
from app.models.wallet import WalletTransaction, WalletTxType
from app.repositories.user_repo import UserRepository
from app.repositories.wallet_repo import WalletRepository
from app.services.log_service import CATEGORY_WALLET, LogService


class WalletService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = WalletRepository(db)
        self.user_repo = UserRepository(db)
        self.log_service = LogService(db)

    async def get_balance(self, user_id: int) -> float:
        user = await self.user_repo.get(user_id)
        if not user:
            raise NotFoundError("User not found")
        return float(user.wallet_balance)

    async def list_transactions(self, user_id: int, offset: int = 0, limit: int = 50):
        return await self.repo.list_for_user(user_id, offset, limit)

    async def _adjust(
        self,
        user_id: int,
        amount: float,
        tx_type: WalletTxType,
        description: str | None = None,
        created_by_id: int | None = None,
        order_id: int | None = None,
    ) -> WalletTransaction:
        user = await self.user_repo.get(user_id)
        if not user:
            raise NotFoundError("User not found")

        new_balance = float(user.wallet_balance) + amount
        if new_balance < 0:
            raise BadRequestError("Insufficient wallet balance")

        user.wallet_balance = new_balance
        tx = WalletTransaction(
            user_id=user_id,
            created_by_id=created_by_id,
            order_id=order_id,
            tx_type=tx_type,
            amount=amount,
            balance_after=new_balance,
            description=description,
        )
        self.db.add(tx)

        sign = "+" if amount >= 0 else ""
        await self.log_service.log(
            CATEGORY_WALLET,
            f"wallet_{tx_type.value}",
            f"کیف پول «{user.full_name}»: {sign}{amount:,.0f} تومان ({description or tx_type.value}) — موجودی جدید: {new_balance:,.0f}",
            level=LogLevel.WARNING if amount < 0 and tx_type != WalletTxType.ORDER_PAYMENT else LogLevel.INFO,
            actor_id=created_by_id,
            target_type="user",
            target_id=user_id,
        )
        await self.db.commit()
        await self.db.refresh(tx)
        return tx

    async def topup(self, user_id: int, amount: float, description: str | None, admin_id: int) -> WalletTransaction:
        return await self._adjust(user_id, amount, WalletTxType.TOPUP, description or "شارژ حساب توسط ادمین", admin_id)

    async def deduct_for_order(self, user_id: int, amount: float, order_id: int) -> WalletTransaction:
        return await self._adjust(
            user_id, -amount, WalletTxType.ORDER_PAYMENT, f"پرداخت سفارش #{order_id} از کیف پول", order_id=order_id
        )

    async def refund(self, user_id: int, amount: float, order_id: int | None, admin_id: int | None = None) -> WalletTransaction:
        return await self._adjust(
            user_id, amount, WalletTxType.REFUND, "بازگشت وجه", admin_id, order_id
        )
