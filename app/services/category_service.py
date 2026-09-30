from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AlreadyExistsError, NotFoundError
from app.models.category import Category
from app.repositories.category_repo import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.services.log_service import CATEGORY_CATEGORY, LogService
from app.services.utils import slugify


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = CategoryRepository(db)
        self.log_service = LogService(db)

    async def list_categories(self, offset: int = 0, limit: int = 100):
        items = await self.repo.list(offset=offset, limit=limit)
        total = await self.repo.count()
        return items, total

    async def get_category(self, category_id: int) -> Category:
        category = await self.repo.get(category_id)
        if not category:
            raise NotFoundError("Category not found")
        return category

    async def get_by_slug(self, slug: str) -> Category:
        category = await self.repo.get_by_slug(slug)
        if not category:
            raise NotFoundError("Category not found")
        return category

    async def create_category(self, data: CategoryCreate, actor_id: int | None = None) -> Category:
        if await self.repo.get_by_name(data.name):
            raise AlreadyExistsError("Category with this name already exists")
        slug = slugify(data.name)
        category = await self.repo.create(**data.model_dump(), slug=slug)
        await self.log_service.log(
            CATEGORY_CATEGORY, "category_created", f"دسته‌بندی «{data.name}» ایجاد شد", actor_id=actor_id,
            target_type="category", target_id=category.id,
        )
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def update_category(self, category_id: int, data: CategoryUpdate, actor_id: int | None = None) -> Category:
        category = await self.get_category(category_id)
        payload = data.model_dump(exclude_unset=True)
        if "name" in payload and payload["name"]:
            payload["slug"] = slugify(payload["name"])
        await self.repo.update(category, **payload)
        await self.log_service.log(
            CATEGORY_CATEGORY, "category_updated", f"دسته‌بندی «{category.name}» ویرایش شد", actor_id=actor_id,
            target_type="category", target_id=category_id,
        )
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete_category(self, category_id: int, actor_id: int | None = None) -> None:
        category = await self.get_category(category_id)
        name = category.name
        await self.repo.delete(category)
        await self.log_service.log(
            CATEGORY_CATEGORY, "category_deleted", f"دسته‌بندی «{name}» حذف شد", actor_id=actor_id,
            target_type="category", target_id=category_id,
        )
        await self.db.commit()
