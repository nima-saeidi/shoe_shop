from sqlalchemy import select

from app.models.coupon import Coupon
from app.repositories.base import BaseRepository


class CouponRepository(BaseRepository[Coupon]):
    model = Coupon

    async def get_by_code(self, code: str) -> Coupon | None:
        stmt = select(Coupon).where(Coupon.code == code.upper())
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
