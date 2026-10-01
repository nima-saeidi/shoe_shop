from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, CurrentUser, DbSession
from app.schemas.support import TicketCreate, TicketMessageCreate, TicketOut
from app.services.ticket_service import TicketService

router = APIRouter()


@router.post("", response_model=TicketOut, status_code=201)
async def create_ticket(data: TicketCreate, current_user: CurrentUser, db: DbSession):
    service = TicketService(db)
    return await service.create_ticket(current_user.id, data)


@router.get("/my", response_model=list[TicketOut])
async def my_tickets(current_user: CurrentUser, db: DbSession, page: int = Query(1, ge=1)):
    service = TicketService(db)
    return await service.list_for_user(current_user.id, offset=(page - 1) * 20, limit=20)


@router.get("/{ticket_id}", response_model=TicketOut)
async def get_ticket(ticket_id: int, current_user: CurrentUser, db: DbSession):
    service = TicketService(db)
    return await service.get_for_user(ticket_id, current_user.id)


@router.post("/{ticket_id}/reply", response_model=TicketOut)
async def reply_ticket(ticket_id: int, data: TicketMessageCreate, current_user: CurrentUser, db: DbSession):
    service = TicketService(db)
    await service.get_for_user(ticket_id, current_user.id)
    return await service.reply(ticket_id, current_user.id, data.message, is_admin=False)


@router.get("", response_model=list[TicketOut], include_in_schema=False)
async def list_all_tickets(db: DbSession, _: CurrentAdmin, status: str | None = None, page: int = Query(1, ge=1)):
    service = TicketService(db)
    return await service.list_all(offset=(page - 1) * 20, limit=20, status=status)


@router.post("/{ticket_id}/admin-reply", response_model=TicketOut, include_in_schema=False)
async def admin_reply_ticket(ticket_id: int, data: TicketMessageCreate, current_admin: CurrentAdmin, db: DbSession):
    service = TicketService(db)
    return await service.reply(ticket_id, current_admin.id, data.message, is_admin=True)


@router.post("/{ticket_id}/close", response_model=TicketOut, include_in_schema=False)
async def close_ticket(ticket_id: int, db: DbSession, current_admin: CurrentAdmin):
    service = TicketService(db)
    return await service.close(ticket_id, actor_id=current_admin.id)
