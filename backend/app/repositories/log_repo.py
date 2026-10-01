from datetime import datetime

from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload

from app.models.log import ActivityLog
from app.repositories.base import BaseRepository


class LogRepository(BaseRepository[ActivityLog]):
    model = ActivityLog

    def _filtered(
        self,
        stmt,
        category: str | None = None,
        level: str | None = None,
        q: str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ):
        if category:
            stmt = stmt.where(ActivityLog.category == category)
        if level:
            stmt = stmt.where(ActivityLog.level == level)
        if q:
            like = f"%{q}%"
            stmt = stmt.where(or_(ActivityLog.message.ilike(like), ActivityLog.actor_label.ilike(like)))
        if date_from:
            stmt = stmt.where(ActivityLog.created_at >= date_from)
        if date_to:
            stmt = stmt.where(ActivityLog.created_at <= date_to)
        return stmt

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
        stmt = select(ActivityLog).options(selectinload(ActivityLog.actor))
        stmt = self._filtered(stmt, category, level, q, date_from, date_to)
        stmt = stmt.order_by(ActivityLog.created_at.desc()).offset(offset).limit(limit)

        count_stmt = select(func.count()).select_from(ActivityLog)
        count_stmt = self._filtered(count_stmt, category, level, q, date_from, date_to)

        items = (await self.db.execute(stmt)).scalars().all()
        total = (await self.db.execute(count_stmt)).scalar_one()
        return items, total

    async def distinct_categories(self) -> list[str]:
        result = await self.db.execute(select(ActivityLog.category).distinct().order_by(ActivityLog.category))
        return [row[0] for row in result.all()]
