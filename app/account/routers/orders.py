from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse

from app.account.deps import CurrentCustomer, DbSession
from app.account.templating import flash, templates
from app.core.exceptions import AppException
from app.services.order_service import OrderService

router = APIRouter()


@router.get("")
async def list_orders(request: Request, db: DbSession, current_customer: CurrentCustomer, page: int = 1):
    service = OrderService(db)
    orders = await service.list_for_user(current_customer.id, offset=(page - 1) * 20, limit=20)
    return templates.TemplateResponse(
        "orders/list.html",
        {"request": request, "current_customer": current_customer, "orders": orders, "page": page, "active_page": "orders"},
    )


@router.get("/{order_id}")
async def order_detail(order_id: int, request: Request, db: DbSession, current_customer: CurrentCustomer):
    service = OrderService(db)
    order = await service.get_order_for_user(order_id, current_customer.id)
    return templates.TemplateResponse(
        "orders/detail.html",
        {"request": request, "current_customer": current_customer, "order": order, "active_page": "orders"},
    )


@router.post("/{order_id}/cancel")
async def cancel_order(order_id: int, request: Request, db: DbSession, current_customer: CurrentCustomer):
    service = OrderService(db)
    try:
        await service.cancel_order(order_id, current_customer.id)
        flash(request, "سفارش با موفقیت لغو شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/account/orders/{order_id}", status_code=302)


@router.post("/{order_id}/pay-from-wallet")
async def pay_from_wallet(order_id: int, request: Request, db: DbSession, current_customer: CurrentCustomer):
    service = OrderService(db)
    try:
        await service.pay_manual_order_from_wallet(order_id, current_customer.id)
        flash(request, "سفارش با موفقیت از کیف پول شما تسویه شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/account/orders/{order_id}", status_code=302)
