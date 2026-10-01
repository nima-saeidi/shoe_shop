from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AlreadyExistsError, BadRequestError, NotFoundError
from app.models.coupon import Coupon, DiscountType
from app.repositories.coupon_repo import CouponRepository
from app.schemas.coupon import CouponCreate, CouponUpdate
from app.services.log_service import CATEGORY_COUPON, LogService


class CouponService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = CouponRepository(db)
        self.log_service = LogService(db)

    async def list_coupons(self, offset: int = 0, limit: int = 50):
        items = await self.repo.list(offset=offset, limit=limit)
        total = await self.repo.count()
        return items, total

    async def get_coupon(self, coupon_id: int) -> Coupon:
        coupon = await self.repo.get(coupon_id)
        if not coupon:
            raise NotFoundError("کد تخفیف پیدا نشد")
        return coupon

    async def create_coupon(self, data: CouponCreate, actor_id: int | None = None) -> Coupon:
        if await self.repo.get_by_code(data.code):
            raise AlreadyExistsError("کد تخفیفی با این کد قبلاً ثبت شده است")
        payload = data.model_dump()
        payload["code"] = payload["code"].upper()
        coupon = await self.repo.create(**payload)
        await self.log_service.log(
            CATEGORY_COUPON, "coupon_created", f"کد تخفیف «{payload['code']}» ایجاد شد", actor_id=actor_id,
            target_type="coupon", target_id=coupon.id,
        )
        await self.db.commit()
        await self.db.refresh(coupon)
        return coupon

    async def update_coupon(self, coupon_id: int, data: CouponUpdate, actor_id: int | None = None) -> Coupon:
        coupon = await self.get_coupon(coupon_id)
        await self.repo.update(coupon, **data.model_dump(exclude_unset=True))
        await self.log_service.log(
            CATEGORY_COUPON, "coupon_updated", f"کد تخفیف «{coupon.code}» ویرایش شد", actor_id=actor_id,
            target_type="coupon", target_id=coupon_id,
        )
        await self.db.commit()
        await self.db.refresh(coupon)
        return coupon

    async def delete_coupon(self, coupon_id: int, actor_id: int | None = None) -> None:
        coupon = await self.get_coupon(coupon_id)
        code = coupon.code
        await self.repo.delete(coupon)
        await self.log_service.log(
            CATEGORY_COUPON, "coupon_deleted", f"کد تخفیف «{code}» حذف شد", actor_id=actor_id,
            target_type="coupon", target_id=coupon_id,
        )
        await self.db.commit()

    async def validate_and_calculate(self, code: str, subtotal: float) -> tuple[Coupon, float]:
        coupon = await self.repo.get_by_code(code)
        if not coupon or not coupon.is_active:
            raise NotFoundError("کد تخفیف نامعتبر است")

        now = datetime.now(timezone.utc)
        if coupon.valid_from and coupon.valid_from > now:
            raise BadRequestError("زمان استفاده از این کد تخفیف هنوز شروع نشده است")
        if coupon.valid_until and coupon.valid_until < now:
            raise BadRequestError("مهلت استفاده از این کد تخفیف به پایان رسیده است")
        if coupon.max_uses is not None and coupon.used_count >= coupon.max_uses:
            raise BadRequestError("سقف استفاده از این کد تخفیف تکمیل شده است")
        if subtotal < float(coupon.min_order_amount):
            raise BadRequestError(f"حداقل مبلغ سفارش برای این کد تخفیف {coupon.min_order_amount:,.0f} تومان است")

        if coupon.discount_type == DiscountType.PERCENT:
            discount = subtotal * float(coupon.discount_value) / 100
        else:
            discount = float(coupon.discount_value)
        discount = min(discount, subtotal)
        return coupon, discount

    async def mark_used(self, coupon: Coupon) -> None:
        coupon.used_count += 1
        await self.db.commit()
