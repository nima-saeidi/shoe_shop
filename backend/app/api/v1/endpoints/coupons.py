from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, CurrentUser, DbSession
from app.schemas.common import Message, Page
from app.schemas.coupon import CouponCreate, CouponOut, CouponUpdate
from app.services.coupon_service import CouponService

router = APIRouter()


@router.get("", response_model=Page[CouponOut], include_in_schema=False)
async def list_coupons(
    db: DbSession,
    _: CurrentAdmin,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    service = CouponService(db)
    items, total = await service.list_coupons(offset=(page - 1) * page_size, limit=page_size)
    pages = max((total + page_size - 1) // page_size, 1)
    return Page(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.post("", response_model=CouponOut, status_code=201, include_in_schema=False)
async def create_coupon(data: CouponCreate, db: DbSession, current_admin: CurrentAdmin):
    service = CouponService(db)
    return await service.create_coupon(data, actor_id=current_admin.id)


@router.put("/{coupon_id}", response_model=CouponOut, include_in_schema=False)
async def update_coupon(coupon_id: int, data: CouponUpdate, db: DbSession, current_admin: CurrentAdmin):
    service = CouponService(db)
    return await service.update_coupon(coupon_id, data, actor_id=current_admin.id)


@router.delete("/{coupon_id}", response_model=Message, include_in_schema=False)
async def delete_coupon(coupon_id: int, db: DbSession, current_admin: CurrentAdmin):
    service = CouponService(db)
    await service.delete_coupon(coupon_id, actor_id=current_admin.id)
    return Message(message="کد تخفیف حذف شد")


@router.get("/validate/{code}")
async def validate_coupon(code: str, subtotal: float, current_user: CurrentUser, db: DbSession):
    service = CouponService(db)
    coupon, discount = await service.validate_and_calculate(code, subtotal)
    return {"code": coupon.code, "discount": discount}
