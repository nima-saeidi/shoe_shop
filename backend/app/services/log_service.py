from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.log import ActivityLog, LogLevel
from app.models.user import User
from app.repositories.log_repo import LogRepository

# Known categories, kept in one place so the admin filter dropdown and the call
# sites agree on the same vocabulary.
CATEGORY_AUTH = "auth"
CATEGORY_SECURITY = "security"
CATEGORY_ORDER = "order"
CATEGORY_PRODUCT = "product"
CATEGORY_CATEGORY = "category"
CATEGORY_BRAND = "brand"
CATEGORY_COUPON = "coupon"
CATEGORY_WALLET = "wallet"
CATEGORY_WHOLESALE = "wholesale"
CATEGORY_RETURN = "return"
CATEGORY_TICKET = "ticket"
CATEGORY_REVIEW = "review"
CATEGORY_USER = "user"


class LogService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = LogRepository(db)

    async def log(
        self,
        category: str,
        action: str,
        message: str,
        level: LogLevel = LogLevel.INFO,
        actor: User | None = None,
        actor_id: int | None = None,
        target_type: str | None = None,
        target_id: int | None = None,
        ip_address: str | None = None,
    ) -> ActivityLog:
        """Writes one audit-log row. Safe to call mid-transaction — it only flushes,
        the caller's own commit() persists it together with the business change."""
        entry = ActivityLog(
            level=level,
            category=category,
            action=action,
            message=message,
            actor_id=actor.id if actor else actor_id,
            actor_label=actor.full_name if actor else None,
            target_type=target_type,
            target_id=target_id,
            ip_address=ip_address,
        )
        self.db.add(entry)
        await self.db.flush()
        return entry

    async def search(
        self,
        offset: int = 0,
        limit: int = 50,
        category: str | None = None,
        level: str | None = None,
        q: str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ):
        return await self.repo.search(offset, limit, category, level, q, date_from, date_to)

    async def distinct_categories(self) -> list[str]:
        return await self.repo.distinct_categories()
