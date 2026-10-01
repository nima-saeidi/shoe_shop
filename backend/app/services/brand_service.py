from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AlreadyExistsError, NotFoundError
from app.models.brand import Brand
from app.repositories.brand_repo import BrandRepository
from app.schemas.brand import BrandCreate, BrandUpdate
from app.services.log_service import CATEGORY_BRAND, LogService
from app.services.media_service import save_uploaded_image
from app.services.utils import slugify


class BrandService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = BrandRepository(db)
        self.log_service = LogService(db)

    async def list_brands(self, offset: int = 0, limit: int = 100):
        items = await self.repo.list(offset=offset, limit=limit)
        total = await self.repo.count()
        return items, total

    async def get_brand(self, brand_id: int) -> Brand:
        brand = await self.repo.get(brand_id)
        if not brand:
            raise NotFoundError("برند پیدا نشد")
        return brand

    async def get_by_slug(self, slug: str) -> Brand:
        brand = await self.repo.get_by_slug(slug)
        if not brand:
            raise NotFoundError("برند پیدا نشد")
        return brand

    async def create_brand(self, data: BrandCreate, actor_id: int | None = None) -> Brand:
        if await self.repo.get_by_name(data.name):
            raise AlreadyExistsError("برندی با این نام قبلاً ثبت شده است")
        slug = slugify(data.name)
        brand = await self.repo.create(**data.model_dump(), slug=slug)
        await self.log_service.log(
            CATEGORY_BRAND, "brand_created", f"برند «{data.name}» ایجاد شد", actor_id=actor_id,
            target_type="brand", target_id=brand.id,
        )
        await self.db.commit()
        await self.db.refresh(brand)
        return brand

    async def update_brand(self, brand_id: int, data: BrandUpdate, actor_id: int | None = None) -> Brand:
        brand = await self.get_brand(brand_id)
        payload = data.model_dump(exclude_unset=True)
        if "name" in payload and payload["name"]:
            payload["slug"] = slugify(payload["name"])
        await self.repo.update(brand, **payload)
        await self.log_service.log(
            CATEGORY_BRAND, "brand_updated", f"برند «{brand.name}» ویرایش شد", actor_id=actor_id,
            target_type="brand", target_id=brand_id,
        )
        await self.db.commit()
        await self.db.refresh(brand)
        return brand

    async def delete_brand(self, brand_id: int, actor_id: int | None = None) -> None:
        brand = await self.get_brand(brand_id)
        name = brand.name
        await self.repo.delete(brand)
        await self.log_service.log(
            CATEGORY_BRAND, "brand_deleted", f"برند «{name}» حذف شد", actor_id=actor_id,
            target_type="brand", target_id=brand_id,
        )
        await self.db.commit()

    async def upload_logo(self, brand_id: int, file: UploadFile, actor_id: int | None = None) -> Brand:
        brand = await self.get_brand(brand_id)
        brand.logo_url = await save_uploaded_image(file, subdir="brands")
        await self.log_service.log(
            CATEGORY_BRAND, "brand_logo_uploaded", f"لوگوی برند «{brand.name}» تغییر کرد", actor_id=actor_id,
            target_type="brand", target_id=brand_id,
        )
        await self.db.commit()
        await self.db.refresh(brand)
        return brand
