from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.models.review import Review
from app.repositories.base import BaseRepository


class ReviewRepository(BaseRepository[Review]):
    model = Review

    async def get_by_product_and_user(self, product_id: int, user_id: int) -> Review | None:
        stmt = select(Review).where(Review.product_id == product_id, Review.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_for_product(self, product_id: int, offset: int = 0, limit: int = 20):
        stmt = (
            select(Review)
            .where(Review.product_id == product_id, Review.is_approved.is_(True))
            .order_by(Review.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def list_all(self, offset: int = 0, limit: int = 20):
        stmt = (
            select(Review)
            .options(selectinload(Review.product), selectinload(Review.user))
            .order_by(Review.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def count_all(self) -> int:
        result = await self.db.execute(select(func.count()).select_from(Review))
        return result.scalar_one()

    async def average_rating(self, product_id: int) -> float:
        stmt = select(func.coalesce(func.avg(Review.rating), 0)).where(
            Review.product_id == product_id, Review.is_approved.is_(True)
        )
        result = await self.db.execute(stmt)
        return float(result.scalar_one())
