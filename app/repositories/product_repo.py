from typing import Any, Sequence

from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload

from app.models.product import Product, ProductVariant
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    model = Product

    def _with_relations(self, stmt):
        return stmt.options(
            selectinload(Product.category),
            selectinload(Product.brand),
            selectinload(Product.images),
            selectinload(Product.variants),
        )

    async def get(self, id_: int) -> Product | None:
        stmt = self._with_relations(select(Product).where(Product.id == id_))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Product | None:
        stmt = self._with_relations(select(Product).where(Product.slug == slug))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_sku(self, sku: str) -> Product | None:
        result = await self.db.execute(select(Product).where(Product.sku == sku))
        return result.scalar_one_or_none()

    async def search(
        self,
        offset: int = 0,
        limit: int = 20,
        q: str | None = None,
        category_id: int | None = None,
        brand_id: int | None = None,
        gender: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        is_active: bool | None = True,
        is_featured: bool | None = None,
        order_by: str = "created_at_desc",
    ) -> tuple[Sequence[Product], int]:
        stmt = select(Product)
        count_stmt = select(func.count()).select_from(Product)

        conditions = []
        if q:
            like = f"%{q}%"
            conditions.append(or_(Product.name.ilike(like), Product.description.ilike(like)))
        if category_id is not None:
            conditions.append(Product.category_id == category_id)
        if brand_id is not None:
            conditions.append(Product.brand_id == brand_id)
        if gender is not None:
            conditions.append(Product.gender == gender)
        if min_price is not None:
            conditions.append(Product.price >= min_price)
        if max_price is not None:
            conditions.append(Product.price <= max_price)
        if is_active is not None:
            conditions.append(Product.is_active == is_active)
        if is_featured is not None:
            conditions.append(Product.is_featured == is_featured)

        for cond in conditions:
            stmt = stmt.where(cond)
            count_stmt = count_stmt.where(cond)

        order_map: dict[str, Any] = {
            "created_at_desc": Product.created_at.desc(),
            "created_at_asc": Product.created_at.asc(),
            "price_asc": Product.price.asc(),
            "price_desc": Product.price.desc(),
            "name_asc": Product.name.asc(),
        }
        stmt = stmt.order_by(order_map.get(order_by, Product.created_at.desc()))
        stmt = self._with_relations(stmt).offset(offset).limit(limit)

        result = await self.db.execute(stmt)
        total_result = await self.db.execute(count_stmt)
        return result.scalars().unique().all(), total_result.scalar_one()

    async def get_variant(self, variant_id: int) -> ProductVariant | None:
        return await self.db.get(ProductVariant, variant_id)
