from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse

from app.account.deps import CurrentCustomer, DbSession
from app.account.templating import flash, templates
from app.core.exceptions import AppException
from app.schemas.support import TicketCreate
from app.services.ticket_service import TicketService

router = APIRouter()


@router.get("")
async def list_tickets(request: Request, db: DbSession, current_customer: CurrentCustomer):
    service = TicketService(db)
    tickets = await service.list_for_user(current_customer.id, limit=50)
    return templates.TemplateResponse(
        "tickets/list.html",
        {"request": request, "current_customer": current_customer, "tickets": tickets, "active_page": "tickets"},
    )


@router.get("/new")
async def new_ticket_form(request: Request, current_customer: CurrentCustomer):
    return templates.TemplateResponse(
        "tickets/form.html", {"request": request, "current_customer": current_customer, "active_page": "tickets"}
    )


@router.post("/new")
async def create_ticket(
    request: Request,
    db: DbSession,
    current_customer: CurrentCustomer,
    subject: str = Form(...),
    message: str = Form(...),
):
    service = TicketService(db)
    try:
        ticket = await service.create_ticket(current_customer.id, TicketCreate(subject=subject, message=message))
        flash(request, "تیکت شما با موفقیت ثبت شد")
        return RedirectResponse(url=f"/account/tickets/{ticket.id}", status_code=302)
    except AppException as exc:
        flash(request, exc.detail, "danger")
        return RedirectResponse(url="/account/tickets/new", status_code=302)


@router.get("/{ticket_id}")
async def ticket_detail(ticket_id: int, request: Request, db: DbSession, current_customer: CurrentCustomer):
    service = TicketService(db)
    try:
        ticket = await service.get_for_user(ticket_id, current_customer.id)
    except AppException as exc:
        flash(request, exc.detail, "danger")
        return RedirectResponse(url="/account/tickets", status_code=302)
    return templates.TemplateResponse(
        "tickets/detail.html",
        {"request": request, "current_customer": current_customer, "ticket": ticket, "active_page": "tickets"},
    )


@router.post("/{ticket_id}/reply")
async def reply_ticket(
    ticket_id: int, request: Request, db: DbSession, current_customer: CurrentCustomer, message: str = Form(...)
):
    service = TicketService(db)
    try:
        await service.get_for_user(ticket_id, current_customer.id)
        await service.reply(ticket_id, current_customer.id, message, is_admin=False)
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/account/tickets/{ticket_id}", status_code=302)
