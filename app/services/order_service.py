from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, InsufficientStockError, NotFoundError
from app.models.order import Order, OrderItem, OrderType
from app.models.user import UserRole
from app.repositories.cart_repo import CartRepository
from app.repositories.order_repo import OrderRepository
from app.repositories.product_repo import ProductRepository
from app.repositories.user_repo import UserRepository
from app.schemas.manual_order import ManualOrderCreate
from app.schemas.order import CheckoutRequest
from app.services.coupon_service import CouponService
from app.services.log_service import CATEGORY_ORDER, LogService
from app.services.sms_service import sms_service
from app.services.utils import generate_order_number
from app.services.wallet_service import WalletService

SHIPPING_FLAT_RATE = 50000.0
FREE_SHIPPING_THRESHOLD = 2000000.0


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = OrderRepository(db)
        self.cart_repo = CartRepository(db)
        self.product_repo = ProductRepository(db)
        self.user_repo = UserRepository(db)
        self.coupon_service = CouponService(db)
        self.wallet_service = WalletService(db)
        self.log_service = LogService(db)

    async def checkout(self, user_id: int, data: CheckoutRequest) -> Order:
        cart = await self.cart_repo.get_by_user_id(user_id)
        if not cart or not cart.items:
            raise BadRequestError("Your cart is empty")

        user = await self.user_repo.get(user_id)
        is_wholesale = bool(user and user.is_wholesale)

        subtotal = 0.0
        line_items = []
        for item in cart.items:
            variant = item.variant
            if item.quantity > variant.stock_quantity:
                raise InsufficientStockError(
                    f"Only {variant.stock_quantity} of {variant.product.name} ({variant.size}/{variant.color}) left"
                )
            base_price = variant.product.price_for(is_wholesale, item.quantity)
            unit_price = base_price + float(variant.extra_price)
            line_items.append((variant, item.quantity, unit_price))
            subtotal += unit_price * item.quantity

        discount_total = 0.0
        coupon = None
        if data.coupon_code:
            coupon, discount_total = await self.coupon_service.validate_and_calculate(data.coupon_code, subtotal)

        shipping_cost = 0.0 if subtotal - discount_total >= FREE_SHIPPING_THRESHOLD else SHIPPING_FLAT_RATE
        grand_total = max(subtotal - discount_total + shipping_cost, 0)

        if data.payment_method == "wallet":
            if not user or float(user.wallet_balance) < grand_total:
                raise BadRequestError("Wallet balance is insufficient for this order")

        order = Order(
            order_number=generate_order_number(),
            user_id=user_id,
            order_type=OrderType.WHOLESALE if is_wholesale else OrderType.RETAIL,
            subtotal=subtotal,
            discount_total=discount_total,
            shipping_cost=shipping_cost,
            grand_total=grand_total,
            coupon_code=data.coupon_code,
            payment_method=data.payment_method,
            shipping_full_name=data.shipping_full_name,
            shipping_phone=data.shipping_phone,
            shipping_address=data.shipping_address,
            shipping_city=data.shipping_city,
            shipping_postal_code=data.shipping_postal_code,
            notes=data.notes,
        )
        self.db.add(order)
        await self.db.flush()

        for variant, quantity, unit_price in line_items:
            self.db.add(
                OrderItem(
                    order_id=order.id,
                    variant_id=variant.id,
                    product_name=variant.product.name,
                    size=variant.size,
                    color=variant.color,
                    unit_price=unit_price,
                    quantity=quantity,
                )
            )
            variant.stock_quantity -= quantity

        if coupon:
            await self.coupon_service.mark_used(coupon)

        for item in list(cart.items):
            await self.db.delete(item)

        await self.log_service.log(
            CATEGORY_ORDER,
            "order_created",
            f"سفارش {order.order_number} توسط مشتری ثبت شد (مبلغ: {grand_total:,.0f} تومان)",
            actor_id=user_id,
            target_type="order",
            target_id=order.id,
        )
        await self.db.commit()

        if data.payment_method == "wallet":
            await self.wallet_service.deduct_for_order(user_id, grand_total, order.id)
            order.payment_status = "paid"
            await self.db.commit()

        return await self.repo.get(order.id)

    async def create_manual_order(self, admin_id: int, data: ManualOrderCreate) -> Order:
        """Used by admin/sales operators to record a phone-in wholesale order."""
        user = await self.user_repo.get(data.user_id)
        if not user:
            raise NotFoundError("Customer not found")
        if not data.items:
            raise BadRequestError("At least one item is required")

        is_wholesale = user.is_wholesale
        subtotal = 0.0
        line_items = []
        for line in data.items:
            variant = await self.product_repo.get_variant(line.variant_id)
            if not variant:
                raise NotFoundError(f"Variant {line.variant_id} not found")
            if line.quantity > variant.stock_quantity:
                raise InsufficientStockError(f"Only {variant.stock_quantity} left for variant {line.variant_id}")
            base_price = variant.product.price_for(is_wholesale, line.quantity)
            unit_price = base_price + float(variant.extra_price)
            line_items.append((variant, line.quantity, unit_price))
            subtotal += unit_price * line.quantity

        grand_total = subtotal

        order = Order(
            order_number=generate_order_number(),
            user_id=user.id,
            created_by_id=admin_id,
            order_type=OrderType.WHOLESALE if is_wholesale else OrderType.RETAIL,
            is_manual=True,
            status="pending",
            payment_status="pending",
            payment_method=data.payment_method,
            subtotal=subtotal,
            discount_total=0,
            shipping_cost=0,
            grand_total=grand_total,
            shipping_full_name=data.shipping_full_name,
            shipping_phone=data.shipping_phone,
            shipping_address=data.shipping_address,
            shipping_city=data.shipping_city,
            shipping_postal_code=data.shipping_postal_code,
            notes=data.notes,
        )
        self.db.add(order)
        await self.db.flush()

        for variant, quantity, unit_price in line_items:
            self.db.add(
                OrderItem(
                    order_id=order.id,
                    variant_id=variant.id,
                    product_name=variant.product.name,
                    size=variant.size,
                    color=variant.color,
                    unit_price=unit_price,
                    quantity=quantity,
                )
            )
            variant.stock_quantity -= quantity

        await self.log_service.log(
            CATEGORY_ORDER,
            "manual_order_created",
            f"سفارش دستی/تلفنی {order.order_number} برای «{user.full_name}» توسط ادمین ثبت شد (مبلغ: {grand_total:,.0f} تومان)",
            actor_id=admin_id,
            target_type="order",
            target_id=order.id,
        )
        await self.db.commit()
        return await self.repo.get(order.id)

    async def pay_manual_order_from_wallet(self, order_id: int, user_id: int) -> Order:
        order = await self.get_order_for_user(order_id, user_id)
        if order.payment_status == "paid":
            raise BadRequestError("This order is already paid")
        await self.wallet_service.deduct_for_order(user_id, float(order.grand_total), order.id)
        order.payment_status = "paid"
        order.status = "confirmed" if order.status == "pending" else order.status
        await self.log_service.log(
            CATEGORY_ORDER,
            "order_paid_from_wallet",
            f"سفارش {order.order_number} از کیف پول تسویه شد (مبلغ: {float(order.grand_total):,.0f} تومان)",
            actor_id=user_id,
            target_type="order",
            target_id=order.id,
        )
        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def get_order(self, order_id: int) -> Order:
        order = await self.repo.get(order_id)
        if not order:
            raise NotFoundError("Order not found")
        return order

    async def get_order_for_user(self, order_id: int, user_id: int) -> Order:
        order = await self.get_order(order_id)
        if order.user_id != user_id:
            # 404 instead of 403 so order ids can't be enumerated by probing ownership.
            raise NotFoundError("Order not found")
        return order

    async def list_for_user(self, user_id: int, offset: int, limit: int):
        return await self.repo.list_for_user(user_id, offset, limit)

    async def cancel_order(self, order_id: int, user_id: int) -> Order:
        order = await self.get_order_for_user(order_id, user_id)
        if order.status not in ("pending", "confirmed"):
            raise BadRequestError("This order can no longer be cancelled")
        for item in order.items:
            variant = await self.product_repo.get_variant(item.variant_id)
            if variant:
                variant.stock_quantity += item.quantity
        order.status = "cancelled"
        await self.log_service.log(
            CATEGORY_ORDER,
            "order_cancelled",
            f"سفارش {order.order_number} توسط مشتری لغو شد",
            actor_id=user_id,
            target_type="order",
            target_id=order.id,
        )
        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def list_all(self, offset: int, limit: int, status: str | None = None, order_type: str | None = None):
        items = await self.repo.list_all(offset, limit, status, order_type)
        total = await self.repo.count_all(status, order_type)
        return items, total

    async def update_status(
        self,
        order_id: int,
        status: str | None,
        payment_status: str | None,
        shipping_provider: str | None = None,
        tracking_code: str | None = None,
        actor_id: int | None = None,
    ) -> Order:
        order = await self.get_order(order_id)
        changes = []
        if status and status != order.status:
            changes.append(f"وضعیت به «{status}»")
            order.status = status
        if payment_status and payment_status != order.payment_status:
            changes.append(f"وضعیت پرداخت به «{payment_status}»")
            order.payment_status = payment_status
        if shipping_provider is not None:
            order.shipping_provider = shipping_provider
        if tracking_code is not None:
            order.tracking_code = tracking_code
            changes.append(f"کد رهگیری «{tracking_code}»")

        if changes:
            await self.log_service.log(
                CATEGORY_ORDER,
                "order_status_updated",
                f"سفارش {order.order_number} به‌روزرسانی شد: {'، '.join(changes)}",
                actor_id=actor_id,
                target_type="order",
                target_id=order.id,
            )
        await self.db.commit()
        await self.db.refresh(order)

        if status and order.user.phone_number:
            from app.admin.translations import translate

            await sms_service.notify_order_status(order.user.phone_number, order.order_number, translate("order_status", status))
        return order
