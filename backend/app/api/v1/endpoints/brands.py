from fastapi import APIRouter, File, Query, UploadFile

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.brand import BrandCreate, BrandOut, BrandUpdate
from app.schemas.common import Message, Page
from app.services.brand_service import BrandService

router = APIRouter()


@router.get("", response_model=Page[BrandOut])
async def list_brands(db: DbSession, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100)):
    service = BrandService(db)
    items, total = await service.list_brands(offset=(page - 1) * page_size, limit=page_size)
    pages = max((total + page_size - 1) // page_size, 1)
    return Page(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/{brand_id}", response_model=BrandOut)
async def get_brand(brand_id: int, db: DbSession):
    service = BrandService(db)
    return await service.get_brand(brand_id)


@router.post("", response_model=BrandOut, status_code=201, include_in_schema=False)
async def create_brand(data: BrandCreate, db: DbSession, current_admin: CurrentAdmin):
    service = BrandService(db)
    return await service.create_brand(data, actor_id=current_admin.id)


@router.put("/{brand_id}", response_model=BrandOut, include_in_schema=False)
async def update_brand(brand_id: int, data: BrandUpdate, db: DbSession, current_admin: CurrentAdmin):
    service = BrandService(db)
    return await service.update_brand(brand_id, data, actor_id=current_admin.id)


@router.delete("/{brand_id}", response_model=Message, include_in_schema=False)
async def delete_brand(brand_id: int, db: DbSession, current_admin: CurrentAdmin):
    service = BrandService(db)
    await service.delete_brand(brand_id, actor_id=current_admin.id)
    return Message(message="برند حذف شد")


@router.post("/{brand_id}/logo", response_model=BrandOut, include_in_schema=False)
async def upload_brand_logo(brand_id: int, db: DbSession, current_admin: CurrentAdmin, file: UploadFile = File(...)):
    service = BrandService(db)
    return await service.upload_logo(brand_id, file, actor_id=current_admin.id)
