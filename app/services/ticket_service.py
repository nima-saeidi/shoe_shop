from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.support import SupportTicket, TicketMessage, TicketStatus
from app.repositories.ticket_repo import TicketRepository
from app.schemas.support import TicketCreate
from app.services.log_service import CATEGORY_TICKET, LogService


class TicketService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = TicketRepository(db)
        self.log_service = LogService(db)

    async def create_ticket(self, user_id: int, data: TicketCreate) -> SupportTicket:
        ticket = await self.repo.create(user_id=user_id, subject=data.subject, status=TicketStatus.OPEN)
        self.db.add(TicketMessage(ticket_id=ticket.id, sender_id=user_id, is_admin=False, message=data.message))
        await self.log_service.log(
            CATEGORY_TICKET,
            "ticket_created",
            f"تیکت جدید «{data.subject}» ثبت شد",
            actor_id=user_id,
            target_type="ticket",
            target_id=ticket.id,
        )
        await self.db.commit()
        return await self.repo.get(ticket.id)

    async def get(self, ticket_id: int) -> SupportTicket:
        ticket = await self.repo.get(ticket_id)
        if not ticket:
            raise NotFoundError("Ticket not found")
        return ticket

    async def get_for_user(self, ticket_id: int, user_id: int) -> SupportTicket:
        ticket = await self.get(ticket_id)
        if ticket.user_id != user_id:
            raise NotFoundError("Ticket not found")
        return ticket

    async def list_for_user(self, user_id: int, offset: int = 0, limit: int = 50):
        return await self.repo.list_for_user(user_id, offset, limit)

    async def list_all(self, offset: int = 0, limit: int = 50, status: str | None = None):
        return await self.repo.list_all(offset, limit, status)

    async def reply(self, ticket_id: int, sender_id: int, message: str, is_admin: bool) -> SupportTicket:
        ticket = await self.get(ticket_id)
        self.db.add(TicketMessage(ticket_id=ticket_id, sender_id=sender_id, is_admin=is_admin, message=message))
        ticket.status = TicketStatus.ANSWERED if is_admin else TicketStatus.OPEN
        if is_admin:
            await self.log_service.log(
                CATEGORY_TICKET,
                "ticket_admin_reply",
                f"پاسخ پشتیبانی به تیکت «{ticket.subject}»",
                actor_id=sender_id,
                target_type="ticket",
                target_id=ticket_id,
            )
        await self.db.commit()
        return await self.repo.get(ticket_id)

    async def close(self, ticket_id: int, actor_id: int | None = None) -> SupportTicket:
        ticket = await self.get(ticket_id)
        ticket.status = TicketStatus.CLOSED
        await self.log_service.log(
            CATEGORY_TICKET,
            "ticket_closed",
            f"تیکت «{ticket.subject}» بسته شد",
            actor_id=actor_id,
            target_type="ticket",
            target_id=ticket_id,
        )
        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket
