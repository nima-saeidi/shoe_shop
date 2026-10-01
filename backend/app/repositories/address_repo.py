from sqlalchemy import select

from app.models.address import Address
from app.repositories.base import BaseRepository


class AddressRepository(BaseRepository[Address]):
    model = Address

    async def list_for_user(self, user_id: int):
        stmt = select(Address).where(Address.user_id == user_id).order_by(Address.is_default.desc())
        result = await self.db.execute(stmt)
        return result.scalars().all()
