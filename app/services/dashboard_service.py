from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order
from app.models.product import Product, ProductVariant
from app.models.user import User, WholesaleStatus
from app.repositories.order_repo import OrderRepository

LOW_STOCK_THRESHOLD = 5


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.order_repo = OrderRepository(db)

    async def get_stats(self) -> dict:
        total_orders = (await self.db.execute(select(func.count()).select_from(Order))).scalar_one()
        total_users = (await self.db.execute(select(func.count()).select_from(User))).scalar_one()
        total_products = (await self.db.execute(select(func.count()).select_from(Product))).scalar_one()
        total_revenue = await self.order_repo.revenue_sum()
        pending_orders = await self.order_repo.count_all(status="pending")

        recent_orders = await self.order_repo.list_all(offset=0, limit=5)

        status_counts_stmt = select(Order.status, func.count()).group_by(Order.status)
        status_counts_result = await self.db.execute(status_counts_stmt)
        status_counts = {row[0]: row[1] for row in status_counts_result.all()}

        pending_wholesale = (
            await self.db.execute(
                select(func.count()).select_from(User).where(User.wholesale_status == WholesaleStatus.PENDING)
            )
        ).scalar_one()

        low_stock_count = (
            await self.db.execute(
                select(func.count()).select_from(ProductVariant).where(ProductVariant.stock_quantity <= LOW_STOCK_THRESHOLD)
            )
        ).scalar_one()

        return {
            "total_orders": total_orders,
            "total_users": total_users,
            "total_products": total_products,
            "total_revenue": total_revenue,
            "pending_orders": pending_orders,
            "recent_orders": recent_orders,
            "status_counts": status_counts,
            "pending_wholesale": pending_wholesale,
            "low_stock_count": low_stock_count,
        }
