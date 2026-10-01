from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, CurrentUser, DbSession
from app.schemas.common import Page
from app.schemas.manual_order import ManualOrderCreate
from app.schemas.order import CheckoutRequest, OrderOut, OrderStatusUpdate
from app.services.order_service import OrderService

router = APIRouter()


@router.post("/checkout", response_model=OrderOut, status_code=201)
async def checkout(data: CheckoutRequest, current_user: CurrentUser, db: DbSession):
    service = OrderService(db)
    return await service.checkout(current_user.id, data)


@router.get("/my", response_model=Page[OrderOut])
async def my_orders(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    service = OrderService(db)
    items = await service.list_for_user(current_user.id, offset=(page - 1) * page_size, limit=page_size)
    return Page(items=items, total=len(items), page=page, page_size=page_size, pages=1)


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: int, current_user: CurrentUser, db: DbSession):
    service = OrderService(db)
    return await service.get_order_for_user(order_id, current_user.id)


@router.post("/{order_id}/cancel", response_model=OrderOut)
async def cancel_order(order_id: int, current_user: CurrentUser, db: DbSession):
    service = OrderService(db)
    return await service.cancel_order(order_id, current_user.id)


@router.post("/{order_id}/pay-from-wallet", response_model=OrderOut)
async def pay_from_wallet(order_id: int, current_user: CurrentUser, db: DbSession):
    """Lets a wholesale customer settle a manually-created pre-invoice using their wallet balance."""
    service = OrderService(db)
    return await service.pay_manual_order_from_wallet(order_id, current_user.id)


@router.post("/manual", response_model=OrderOut, status_code=201, include_in_schema=False)
async def create_manual_order(data: ManualOrderCreate, current_admin: CurrentAdmin, db: DbSession):
    """Used by sales operators to record a phone-in wholesale/retail order."""
    service = OrderService(db)
    return await service.create_manual_order(current_admin.id, data)


@router.get("", response_model=Page[OrderOut], include_in_schema=False)
async def list_all_orders(
    db: DbSession,
    _: CurrentAdmin,
    status: str | None = None,
    order_type: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    service = OrderService(db)
    items, total = await service.list_all(
        offset=(page - 1) * page_size, limit=page_size, status=status, order_type=order_type
    )
    pages = max((total + page_size - 1) // page_size, 1)
    return Page(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.put("/{order_id}/status", response_model=OrderOut, include_in_schema=False)
async def update_order_status(order_id: int, data: OrderStatusUpdate, db: DbSession, current_admin: CurrentAdmin):
    service = OrderService(db)
    return await service.update_status(
        order_id, data.status, data.payment_status, data.shipping_provider, data.tracking_code, actor_id=current_admin.id
    )
