from datetime import datetime

from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import flash, templates
from app.core.exceptions import AppException
from app.models.coupon import DiscountType
from app.schemas.coupon import CouponCreate, CouponUpdate
from app.services.coupon_service import CouponService

router = APIRouter()


@router.get("")
async def list_coupons(request: Request, db: DbSession, current_admin: CurrentAdminUser, page: int = 1):
    service = CouponService(db)
    items, total = await service.list_coupons(offset=(page - 1) * 20, limit=20)
    return templates.TemplateResponse(
        "coupons/list.html",
        {
            "request": request,
            "current_admin": current_admin,
            "coupons": items,
            "total": total,
            "page": page,
            "active_page": "coupons",
        },
    )


@router.get("/new")
async def new_coupon_form(request: Request, current_admin: CurrentAdminUser):
    return templates.TemplateResponse(
        "coupons/form.html", {"request": request, "current_admin": current_admin, "coupon": None, "active_page": "coupons"}
    )


@router.post("/new")
async def create_coupon(
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    code: str = Form(...),
    discount_type: str = Form(...),
    discount_value: float = Form(...),
    min_order_amount: float = Form(0),
    max_uses: str = Form(""),
    is_active: bool = Form(False),
    valid_from: str = Form(""),
    valid_until: str = Form(""),
):
    service = CouponService(db)
    try:
        await service.create_coupon(
            CouponCreate(
                code=code,
                discount_type=DiscountType(discount_type),
                discount_value=discount_value,
                min_order_amount=min_order_amount,
                max_uses=int(max_uses) if max_uses else None,
                is_active=is_active,
                valid_from=datetime.fromisoformat(valid_from) if valid_from else None,
                valid_until=datetime.fromisoformat(valid_until) if valid_until else None,
            ),
            actor_id=current_admin.id,
        )
        flash(request, "کد تخفیف با موفقیت ایجاد شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/coupons", status_code=302)


@router.post("/{coupon_id}/delete")
async def delete_coupon(coupon_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = CouponService(db)
    try:
        await service.delete_coupon(coupon_id, actor_id=current_admin.id)
        flash(request, "کد تخفیف حذف شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/coupons", status_code=302)


@router.post("/{coupon_id}/toggle-active")
async def toggle_active(coupon_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = CouponService(db)
    try:
        coupon = await service.get_coupon(coupon_id)
        await service.update_coupon(coupon_id, CouponUpdate(is_active=not coupon.is_active), actor_id=current_admin.id)
        flash(request, "وضعیت کد تخفیف به‌روزرسانی شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/coupons", status_code=302)
