from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.schemas.common import Message, Page
from app.services.category_service import CategoryService

router = APIRouter()


@router.get("", response_model=Page[CategoryOut])
async def list_categories(db: DbSession, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100)):
    service = CategoryService(db)
    items, total = await service.list_categories(offset=(page - 1) * page_size, limit=page_size)
    pages = max((total + page_size - 1) // page_size, 1)
    return Page(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/{category_id}", response_model=CategoryOut)
async def get_category(category_id: int, db: DbSession):
    service = CategoryService(db)
    return await service.get_category(category_id)


@router.post("", response_model=CategoryOut, status_code=201, include_in_schema=False)
async def create_category(data: CategoryCreate, db: DbSession, current_admin: CurrentAdmin):
    service = CategoryService(db)
    return await service.create_category(data, actor_id=current_admin.id)


@router.put("/{category_id}", response_model=CategoryOut, include_in_schema=False)
async def update_category(category_id: int, data: CategoryUpdate, db: DbSession, current_admin: CurrentAdmin):
    service = CategoryService(db)
    return await service.update_category(category_id, data, actor_id=current_admin.id)


@router.delete("/{category_id}", response_model=Message, include_in_schema=False)
async def delete_category(category_id: int, db: DbSession, current_admin: CurrentAdmin):
    service = CategoryService(db)
    await service.delete_category(category_id, actor_id=current_admin.id)
    return Message(message="Category deleted")
