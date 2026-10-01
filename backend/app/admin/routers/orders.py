from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import flash, templates
from app.core.exceptions import AppException
from app.models.product import ProductVariant
from app.models.user import User, UserRole, WholesaleStatus
from app.schemas.manual_order import ManualOrderCreate, ManualOrderItemInput
from app.services.order_service import OrderService

router = APIRouter()

STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"]
PAYMENT_STATUS_OPTIONS = ["pending", "paid", "failed", "refunded"]
SHIPPING_PROVIDERS = ["پست پیشتاز", "تیپاکس", "باربری", "پیک موتوری", "سایر"]


@router.get("")
async def list_orders(
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    page: int = 1,
    status: str | None = None,
    order_type: str | None = None,
):
    service = OrderService(db)
    items, total = await service.list_all(offset=(page - 1) * 20, limit=20, status=status, order_type=order_type)
    pages = max((total + 19) // 20, 1)
    return templates.TemplateResponse(
        "orders/list.html",
        {
            "request": request,
            "current_admin": current_admin,
            "orders": items,
            "total": total,
            "page": page,
            "pages": pages,
            "status_filter": status or "",
            "order_type_filter": order_type or "",
            "status_options": STATUS_OPTIONS,
            "active_page": "orders",
        },
    )


@router.get("/manual/new")
async def new_manual_order_form(request: Request, db: DbSession, current_admin: CurrentAdminUser, q: str | None = None):
    customers = []
    if q:
        stmt = (
            select(User)
            .where((User.full_name.ilike(f"%{q}%")) | (User.email.ilike(f"%{q}%")) | (User.phone_number.ilike(f"%{q}%")))
            .limit(20)
        )
        customers = (await db.execute(stmt)).scalars().all()

    variants_stmt = (
        select(ProductVariant)
        .options(selectinload(ProductVariant.product))
        .order_by(ProductVariant.product_id)
        .limit(500)
    )
    variants = (await db.execute(variants_stmt)).scalars().all()

    return templates.TemplateResponse(
        "orders/manual_new.html",
        {
            "request": request,
            "current_admin": current_admin,
            "customers": customers,
            "variants": variants,
            "q": q or "",
            "active_page": "orders",
        },
    )


@router.post("/manual/new")
async def create_manual_order(
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    user_id: int = Form(...),
    variant_ids: list[str] = Form(...),
    quantities: list[str] = Form(...),
    shipping_full_name: str = Form(...),
    shipping_phone: str = Form(...),
    shipping_address: str = Form(...),
    shipping_city: str = Form(...),
    shipping_postal_code: str = Form(...),
    payment_method: str = Form("bank_transfer"),
    notes: str = Form(""),
):
    service = OrderService(db)
    items = [
        ManualOrderItemInput(variant_id=int(vid), quantity=int(qty))
        for vid, qty in zip(variant_ids, quantities)
        if vid and qty
    ]
    try:
        order = await service.create_manual_order(
            current_admin.id,
            ManualOrderCreate(
                user_id=user_id,
                items=items,
                shipping_full_name=shipping_full_name,
                shipping_phone=shipping_phone,
                shipping_address=shipping_address,
                shipping_city=shipping_city,
                shipping_postal_code=shipping_postal_code,
                payment_method=payment_method,
                notes=notes or None,
            ),
        )
        flash(request, f"پیش‌فاکتور سفارش عمده {order.order_number} ثبت شد")
        return RedirectResponse(url=f"/admin/orders/{order.id}", status_code=302)
    except AppException as exc:
        flash(request, exc.detail, "danger")
        return RedirectResponse(url="/admin/orders/manual/new", status_code=302)


@router.get("/{order_id}")
async def order_detail(order_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = OrderService(db)
    order = await service.get_order(order_id)
    return templates.TemplateResponse(
        "orders/detail.html",
        {
            "request": request,
            "current_admin": current_admin,
            "order": order,
            "status_options": STATUS_OPTIONS,
            "payment_status_options": PAYMENT_STATUS_OPTIONS,
            "shipping_providers": SHIPPING_PROVIDERS,
            "active_page": "orders",
        },
    )


@router.post("/{order_id}/status")
async def update_order_status(
    order_id: int,
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    status: str = Form(...),
    payment_status: str = Form(...),
    shipping_provider: str = Form(""),
    tracking_code: str = Form(""),
):
    service = OrderService(db)
    try:
        await service.update_status(
            order_id, status, payment_status, shipping_provider or None, tracking_code or None, actor_id=current_admin.id
        )
        flash(request, "سفارش با موفقیت به‌روزرسانی شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/admin/orders/{order_id}", status_code=302)
