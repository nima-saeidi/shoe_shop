from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    model = Order

    def _with_items(self, stmt):
        return stmt.options(selectinload(Order.items), selectinload(Order.user), selectinload(Order.created_by))

    async def get(self, id_: int) -> Order | None:
        stmt = self._with_items(select(Order).where(Order.id == id_))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_order_number(self, order_number: str) -> Order | None:
        stmt = self._with_items(select(Order).where(Order.order_number == order_number))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: int, offset: int = 0, limit: int = 20):
        stmt = (
            self._with_items(select(Order))
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().unique().all()

    async def list_all(
        self,
        offset: int = 0,
        limit: int = 20,
        status: str | None = None,
        order_type: str | None = None,
    ):
        stmt = self._with_items(select(Order)).order_by(Order.created_at.desc())
        if status:
            stmt = stmt.where(Order.status == status)
        if order_type:
            stmt = stmt.where(Order.order_type == order_type)
        stmt = stmt.offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().unique().all()

    async def count_all(self, status: str | None = None, order_type: str | None = None) -> int:
        stmt = select(func.count()).select_from(Order)
        if status:
            stmt = stmt.where(Order.status == status)
        if order_type:
            stmt = stmt.where(Order.order_type == order_type)
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def revenue_sum(self, order_type: str | None = None) -> float:
        stmt = select(func.coalesce(func.sum(Order.grand_total), 0)).where(Order.payment_status == "paid")
        if order_type:
            stmt = stmt.where(Order.order_type == order_type)
        result = await self.db.execute(stmt)
        return float(result.scalar_one())

    async def sales_by_day(self, days: int = 14):
        stmt = (
            select(func.date(Order.created_at).label("day"), func.sum(Order.grand_total), func.count())
            .where(Order.payment_status == "paid")
            .group_by(func.date(Order.created_at))
            .order_by(func.date(Order.created_at).desc())
            .limit(days)
        )
        result = await self.db.execute(stmt)
        return result.all()

    async def top_products(self, limit: int = 10):
        stmt = (
            select(OrderItem.product_name, func.sum(OrderItem.quantity).label("qty"))
            .group_by(OrderItem.product_name)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.all()

    async def top_sizes(self, limit: int = 10):
        stmt = (
            select(OrderItem.size, func.sum(OrderItem.quantity).label("qty"))
            .group_by(OrderItem.size)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.all()
