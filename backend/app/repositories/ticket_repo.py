from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.support import SupportTicket, TicketMessage
from app.repositories.base import BaseRepository


class TicketRepository(BaseRepository[SupportTicket]):
    model = SupportTicket

    def _with_relations(self, stmt):
        return stmt.options(
            selectinload(SupportTicket.messages).selectinload(TicketMessage.sender),
            selectinload(SupportTicket.user),
        )

    async def get(self, id_: int):
        stmt = self._with_relations(select(SupportTicket).where(SupportTicket.id == id_))
        # populate_existing: re-read the messages collection even if this ticket is already in the
        # session (otherwise a reply just added would be missing from the response).
        result = await self.db.execute(stmt.execution_options(populate_existing=True))
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: int, offset: int = 0, limit: int = 50):
        stmt = self._with_relations(select(SupportTicket).where(SupportTicket.user_id == user_id))
        stmt = stmt.order_by(SupportTicket.updated_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().unique().all()

    async def list_all(self, offset: int = 0, limit: int = 50, status: str | None = None):
        stmt = self._with_relations(select(SupportTicket))
        if status:
            stmt = stmt.where(SupportTicket.status == status)
        stmt = stmt.order_by(SupportTicket.updated_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().unique().all()
