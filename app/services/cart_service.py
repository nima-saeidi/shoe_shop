from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, InsufficientStockError, NotFoundError
from app.models.cart import Cart
from app.repositories.cart_repo import CartRepository
from app.repositories.product_repo import ProductRepository
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartItemOut, CartOut


class CartService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.cart_repo = CartRepository(db)
        self.product_repo = ProductRepository(db)

    async def _get_or_create_cart(self, user_id: int) -> Cart:
        cart = await self.cart_repo.get_by_user_id(user_id)
        if not cart:
            cart = await self.cart_repo.create(user_id=user_id)
            await self.db.commit()
            cart = await self.cart_repo.get_by_user_id(user_id)
        return cart

    def _to_cart_out(self, cart: Cart) -> CartOut:
        items = []
        subtotal = 0.0
        for item in cart.items:
            variant = item.variant
            unit_price = variant.product.final_price + float(variant.extra_price)
            line_total = unit_price * item.quantity
            subtotal += line_total
            primary_image = next((img.image_url for img in variant.product.images if img.is_primary), None)
            items.append(
                CartItemOut(
                    id=item.id,
                    variant_id=variant.id,
                    quantity=item.quantity,
                    product_name=variant.product.name,
                    size=variant.size,
                    color=variant.color,
                    unit_price=unit_price,
                    line_total=line_total,
                    image_url=primary_image,
                )
            )
        return CartOut(
            id=cart.id,
            items=items,
            subtotal=subtotal,
            total_items=sum(i.quantity for i in items),
        )

    async def get_cart(self, user_id: int) -> CartOut:
        cart = await self._get_or_create_cart(user_id)
        return self._to_cart_out(cart)

    async def add_item(self, user_id: int, data: CartItemCreate) -> CartOut:
        cart = await self._get_or_create_cart(user_id)
        variant = await self.product_repo.get_variant(data.variant_id)
        if not variant:
            raise NotFoundError("Product variant not found")

        existing = await self.cart_repo.get_item(cart.id, data.variant_id)
        new_quantity = (existing.quantity if existing else 0) + data.quantity
        if new_quantity > variant.stock_quantity:
            raise InsufficientStockError(f"Only {variant.stock_quantity} items in stock")

        if existing:
            existing.quantity = new_quantity
        else:
            from app.models.cart import CartItem

            self.db.add(CartItem(cart_id=cart.id, variant_id=data.variant_id, quantity=data.quantity))

        await self.db.commit()
        return await self.get_cart(user_id)

    async def update_item(self, user_id: int, item_id: int, data: CartItemUpdate) -> CartOut:
        item = await self.cart_repo.get_item_by_id(item_id)
        cart = await self._get_or_create_cart(user_id)
        if not item or item.cart_id != cart.id:
            raise NotFoundError("Cart item not found")
        variant = await self.product_repo.get_variant(item.variant_id)
        if data.quantity > variant.stock_quantity:
            raise InsufficientStockError(f"Only {variant.stock_quantity} items in stock")
        item.quantity = data.quantity
        await self.db.commit()
        return await self.get_cart(user_id)

    async def remove_item(self, user_id: int, item_id: int) -> CartOut:
        item = await self.cart_repo.get_item_by_id(item_id)
        cart = await self._get_or_create_cart(user_id)
        if not item or item.cart_id != cart.id:
            raise NotFoundError("Cart item not found")
        await self.db.delete(item)
        await self.db.commit()
        return await self.get_cart(user_id)

    async def clear_cart(self, user_id: int) -> None:
        cart = await self._get_or_create_cart(user_id)
        for item in list(cart.items):
            await self.db.delete(item)
        await self.db.commit()
