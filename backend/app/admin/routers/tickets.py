from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import flash, templates
from app.core.exceptions import AppException
from app.services.ticket_service import TicketService

router = APIRouter()


@router.get("")
async def list_tickets(request: Request, db: DbSession, current_admin: CurrentAdminUser, status: str | None = None):
    service = TicketService(db)
    tickets = await service.list_all(limit=100, status=status)
    return templates.TemplateResponse(
        "tickets/list.html",
        {
            "request": request,
            "current_admin": current_admin,
            "tickets": tickets,
            "status_filter": status or "",
            "active_page": "tickets",
        },
    )


@router.get("/{ticket_id}")
async def ticket_detail(ticket_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = TicketService(db)
    ticket = await service.get(ticket_id)
    return templates.TemplateResponse(
        "tickets/detail.html",
        {"request": request, "current_admin": current_admin, "ticket": ticket, "active_page": "tickets"},
    )


@router.post("/{ticket_id}/reply")
async def reply_ticket(
    ticket_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser, message: str = Form(...)
):
    service = TicketService(db)
    try:
        await service.reply(ticket_id, current_admin.id, message, is_admin=True)
        flash(request, "پاسخ ارسال شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/admin/tickets/{ticket_id}", status_code=302)


@router.post("/{ticket_id}/close")
async def close_ticket(ticket_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = TicketService(db)
    try:
        await service.close(ticket_id, actor_id=current_admin.id)
        flash(request, "تیکت بسته شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/admin/tickets/{ticket_id}", status_code=302)
