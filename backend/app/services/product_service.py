from typing import Sequence

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AlreadyExistsError, NotFoundError
from app.models.product import Product, ProductImage, ProductVariant
from app.repositories.product_repo import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate, ProductVariantCreate, ProductVariantUpdate
from app.services.log_service import CATEGORY_PRODUCT, LogService
from app.services.media_service import save_uploaded_image
from app.services.utils import slugify


class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ProductRepository(db)
        self.log_service = LogService(db)

    async def search_products(self, **kwargs):
        return await self.repo.search(**kwargs)

    async def get_product(self, product_id: int) -> Product:
        product = await self.repo.get(product_id)
        if not product:
            raise NotFoundError("محصول پیدا نشد")
        return product

    async def get_by_slug(self, slug: str) -> Product:
        product = await self.repo.get_by_slug(slug)
        if not product:
            raise NotFoundError("محصول پیدا نشد")
        return product

    async def create_product(self, data: ProductCreate, actor_id: int | None = None) -> Product:
        if await self.repo.get_by_sku(data.sku):
            raise AlreadyExistsError("محصولی با این کد کالا (SKU) قبلاً ثبت شده است")

        payload = data.model_dump(exclude={"variants"})
        slug = slugify(data.name)
        base_slug = slug
        counter = 1
        while await self.repo.get_by_slug(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1

        product = await self.repo.create(**payload, slug=slug)
        for variant in data.variants:
            self.db.add(ProductVariant(product_id=product.id, **variant.model_dump()))
        await self.log_service.log(
            CATEGORY_PRODUCT, "product_created", f"محصول «{data.name}» ایجاد شد", actor_id=actor_id,
            target_type="product", target_id=product.id,
        )
        await self.db.commit()
        return await self.get_product(product.id)

    async def update_product(self, product_id: int, data: ProductUpdate, actor_id: int | None = None) -> Product:
        product = await self.get_product(product_id)
        payload = data.model_dump(exclude_unset=True)
        await self.repo.update(product, **payload)
        await self.log_service.log(
            CATEGORY_PRODUCT, "product_updated", f"محصول «{product.name}» ویرایش شد", actor_id=actor_id,
            target_type="product", target_id=product_id,
        )
        await self.db.commit()
        return await self.get_product(product_id)

    async def delete_product(self, product_id: int, actor_id: int | None = None) -> None:
        product = await self.get_product(product_id)
        name = product.name
        await self.repo.delete(product)
        await self.log_service.log(
            CATEGORY_PRODUCT, "product_deleted", f"محصول «{name}» حذف شد", actor_id=actor_id,
            target_type="product", target_id=product_id,
        )
        await self.db.commit()

    async def add_variant(self, product_id: int, data: ProductVariantCreate) -> ProductVariant:
        await self.get_product(product_id)
        variant = ProductVariant(product_id=product_id, **data.model_dump())
        self.db.add(variant)
        await self.db.commit()
        await self.db.refresh(variant)
        return variant

    async def update_variant(self, variant_id: int, data: ProductVariantUpdate) -> ProductVariant:
        variant = await self.repo.get_variant(variant_id)
        if not variant:
            raise NotFoundError("مدل (سایز/رنگ) پیدا نشد")
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(variant, key, value)
        await self.db.commit()
        await self.db.refresh(variant)
        return variant

    async def delete_variant(self, variant_id: int) -> None:
        variant = await self.repo.get_variant(variant_id)
        if not variant:
            raise NotFoundError("مدل (سایز/رنگ) پیدا نشد")
        await self.db.delete(variant)
        await self.db.commit()

    async def add_image(
        self, product_id: int, file: UploadFile, is_primary: bool = False, color: str | None = None
    ) -> ProductImage:
        product = await self.get_product(product_id)
        image_url = await save_uploaded_image(file, subdir=f"products/{product_id}")

        if is_primary:
            for img in product.images:
                img.is_primary = False

        image = ProductImage(
            product_id=product_id,
            image_url=image_url,
            color=color or None,
            sort_order=len(product.images),
            is_primary=is_primary or not product.images,
        )
        self.db.add(image)
        await self.db.commit()
        await self.db.refresh(image)
        return image

    async def add_images(
        self, product_id: int, files: Sequence[UploadFile], color: str | None = None
    ) -> list[ProductImage]:
        """Uploads several photos at once for the same shoe (e.g. all angles of one design/color)."""
        product = await self.get_product(product_id)
        created: list[ProductImage] = []
        has_primary_already = any(img.is_primary for img in product.images)

        for index, file in enumerate(files):
            image_url = await save_uploaded_image(file, subdir=f"products/{product_id}")
            image = ProductImage(
                product_id=product_id,
                image_url=image_url,
                color=color or None,
                sort_order=len(product.images) + len(created),
                is_primary=not has_primary_already and index == 0 and not product.images,
            )
            self.db.add(image)
            created.append(image)

        await self.db.commit()
        for image in created:
            await self.db.refresh(image)
        return created

    async def delete_image(self, image_id: int) -> None:
        image = await self.db.get(ProductImage, image_id)
        if not image:
            raise NotFoundError("تصویر پیدا نشد")
        await self.db.delete(image)
        await self.db.commit()

    async def set_primary_image(self, product_id: int, image_id: int) -> None:
        product = await self.get_product(product_id)
        target = await self.db.get(ProductImage, image_id)
        if not target or target.product_id != product_id:
            raise NotFoundError("تصویر پیدا نشد")
        for img in product.images:
            img.is_primary = img.id == image_id
        await self.db.commit()
