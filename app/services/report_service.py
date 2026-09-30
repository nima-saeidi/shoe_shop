from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.product import Product, ProductVariant
from app.repositories.order_repo import OrderRepository

LOW_STOCK_THRESHOLD = 5


class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.order_repo = OrderRepository(db)

    async def sales_report(self, days: int = 14):
        rows = await self.order_repo.sales_by_day(days)
        return [{"day": r[0], "revenue": float(r[1]), "orders": r[2]} for r in rows]

    async def top_products(self, limit: int = 10):
        rows = await self.order_repo.top_products(limit)
        return [{"name": r[0], "qty": r[1]} for r in rows]

    async def top_sizes(self, limit: int = 10):
        rows = await self.order_repo.top_sizes(limit)
        return [{"size": r[0], "qty": r[1]} for r in rows]

    async def retail_vs_wholesale_revenue(self):
        retail = await self.order_repo.revenue_sum(order_type="retail")
        wholesale = await self.order_repo.revenue_sum(order_type="wholesale")
        return {"retail": retail, "wholesale": wholesale}

    async def low_stock_variants(self, threshold: int = LOW_STOCK_THRESHOLD):
        stmt = (
            select(ProductVariant)
            .where(ProductVariant.stock_quantity <= threshold)
            .options(selectinload(ProductVariant.product))
            .order_by(ProductVariant.stock_quantity.asc())
            .limit(50)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()
