from sqlalchemy import select

from app.models.brand import Brand
from app.repositories.base import BaseRepository


class BrandRepository(BaseRepository[Brand]):
    model = Brand

    async def get_by_slug(self, slug: str) -> Brand | None:
        result = await self.db.execute(select(Brand).where(Brand.slug == slug))
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Brand | None:
        result = await self.db.execute(select(Brand).where(Brand.name == name))
        return result.scalar_one_or_none()
