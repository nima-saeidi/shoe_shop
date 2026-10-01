from sqlalchemy import select

from app.models.wallet import WalletTransaction
from app.repositories.base import BaseRepository


class WalletRepository(BaseRepository[WalletTransaction]):
    model = WalletTransaction

    async def list_for_user(self, user_id: int, offset: int = 0, limit: int = 50):
        stmt = (
            select(WalletTransaction)
            .where(WalletTransaction.user_id == user_id)
            .order_by(WalletTransaction.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()
