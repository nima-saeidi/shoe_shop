from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.return_request import ReturnRequest
from app.repositories.base import BaseRepository


class ReturnRepository(BaseRepository[ReturnRequest]):
    model = ReturnRequest

    def _with_relations(self, stmt):
        return stmt.options(
            selectinload(ReturnRequest.order_item),
            selectinload(ReturnRequest.order),
            selectinload(ReturnRequest.user),
        )

    async def get(self, id_: int):
        stmt = self._with_relations(select(ReturnRequest).where(ReturnRequest.id == id_))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: int, offset: int = 0, limit: int = 50):
        stmt = self._with_relations(select(ReturnRequest).where(ReturnRequest.user_id == user_id))
        stmt = stmt.order_by(ReturnRequest.created_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().unique().all()

    async def list_all(self, offset: int = 0, limit: int = 50, status: str | None = None):
        stmt = self._with_relations(select(ReturnRequest))
        if status:
            stmt = stmt.where(ReturnRequest.status == status)
        stmt = stmt.order_by(ReturnRequest.created_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().unique().all()
