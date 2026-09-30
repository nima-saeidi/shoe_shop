from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.account.deps import CurrentCustomer, DbSession
from app.account.templating import flash, templates
from app.core.exceptions import AppException
from app.models.order import OrderItem, OrderStatus
from app.models.return_request import ReturnReason
from app.schemas.return_request import ReturnRequestCreate
from app.services.return_service import ReturnService

router = APIRouter()


@router.get("")
async def list_returns(request: Request, db: DbSession, current_customer: CurrentCustomer, page: int = 1):
    service = ReturnService(db)
    returns = await service.list_for_user(current_customer.id, offset=(page - 1) * 20, limit=20)
    return templates.TemplateResponse(
        "returns/list.html",
        {"request": request, "current_customer": current_customer, "returns": returns, "active_page": "returns"},
    )


@router.get("/new")
async def new_return_form(order_item_id: int, request: Request, db: DbSession, current_customer: CurrentCustomer):
    stmt = (
        select(OrderItem)
        .where(OrderItem.id == order_item_id)
        .options(selectinload(OrderItem.order))
    )
    order_item = (await db.execute(stmt)).scalar_one_or_none()
    if not order_item or order_item.order.user_id != current_customer.id:
        flash(request, "قلم سفارش یافت نشد", "danger")
        return RedirectResponse(url="/account/orders", status_code=302)
    if order_item.order.status != OrderStatus.DELIVERED:
        flash(request, "فقط سفارش‌های تحویل‌داده‌شده قابل مرجوع کردن هستند", "danger")
        return RedirectResponse(url=f"/account/orders/{order_item.order_id}", status_code=302)

    return templates.TemplateResponse(
        "returns/form.html",
        {"request": request, "current_customer": current_customer, "order_item": order_item, "active_page": "returns"},
    )


@router.post("/new")
async def create_return(
    request: Request,
    db: DbSession,
    current_customer: CurrentCustomer,
    order_item_id: int = Form(...),
    reason: str = Form(...),
    description: str = Form(""),
):
    service = ReturnService(db)
    try:
        await service.create_return(
            current_customer.id,
            ReturnRequestCreate(order_item_id=order_item_id, reason=ReturnReason(reason), description=description or None),
        )
        flash(request, "درخواست مرجوعی شما ثبت شد")
        return RedirectResponse(url="/account/returns", status_code=302)
    except AppException as exc:
        flash(request, exc.detail, "danger")
        return RedirectResponse(url=f"/account/returns/new?order_item_id={order_item_id}", status_code=302)
