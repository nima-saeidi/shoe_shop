from fastapi import APIRouter, File, Query, UploadFile

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.common import Message, Page
from app.schemas.product import (
    ProductCreate,
    ProductImageOut,
    ProductOut,
    ProductUpdate,
    ProductVariantCreate,
    ProductVariantOut,
    ProductVariantUpdate,
)
from app.services.product_service import ProductService

router = APIRouter()


@router.get("", response_model=Page[ProductOut])
async def list_products(
    db: DbSession,
    q: str | None = None,
    category_id: int | None = None,
    brand_id: int | None = None,
    gender: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    is_featured: bool | None = None,
    order_by: str = "created_at_desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    service = ProductService(db)
    items, total = await service.search_products(
        offset=(page - 1) * page_size,
        limit=page_size,
        q=q,
        category_id=category_id,
        brand_id=brand_id,
        gender=gender,
        min_price=min_price,
        max_price=max_price,
        is_featured=is_featured,
        order_by=order_by,
    )
    pages = max((total + page_size - 1) // page_size, 1)
    return Page(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: int, db: DbSession):
    service = ProductService(db)
    return await service.get_product(product_id)


@router.get("/slug/{slug}", response_model=ProductOut)
async def get_product_by_slug(slug: str, db: DbSession):
    service = ProductService(db)
    return await service.get_by_slug(slug)


@router.post("", response_model=ProductOut, status_code=201, include_in_schema=False)
async def create_product(data: ProductCreate, db: DbSession, current_admin: CurrentAdmin):
    service = ProductService(db)
    return await service.create_product(data, actor_id=current_admin.id)


@router.put("/{product_id}", response_model=ProductOut, include_in_schema=False)
async def update_product(product_id: int, data: ProductUpdate, db: DbSession, current_admin: CurrentAdmin):
    service = ProductService(db)
    return await service.update_product(product_id, data, actor_id=current_admin.id)


@router.delete("/{product_id}", response_model=Message, include_in_schema=False)
async def delete_product(product_id: int, db: DbSession, current_admin: CurrentAdmin):
    service = ProductService(db)
    await service.delete_product(product_id, actor_id=current_admin.id)
    return Message(message="محصول حذف شد")


@router.post("/{product_id}/variants", response_model=ProductVariantOut, status_code=201, include_in_schema=False)
async def add_variant(product_id: int, data: ProductVariantCreate, db: DbSession, _: CurrentAdmin):
    service = ProductService(db)
    return await service.add_variant(product_id, data)


@router.put("/variants/{variant_id}", response_model=ProductVariantOut, include_in_schema=False)
async def update_variant(variant_id: int, data: ProductVariantUpdate, db: DbSession, _: CurrentAdmin):
    service = ProductService(db)
    return await service.update_variant(variant_id, data)


@router.delete("/variants/{variant_id}", response_model=Message, include_in_schema=False)
async def delete_variant(variant_id: int, db: DbSession, _: CurrentAdmin):
    service = ProductService(db)
    await service.delete_variant(variant_id)
    return Message(message="مدل حذف شد")


@router.post("/{product_id}/images", response_model=ProductImageOut, status_code=201, include_in_schema=False)
async def upload_image(
    product_id: int,
    db: DbSession,
    _: CurrentAdmin,
    file: UploadFile = File(...),
    is_primary: bool = False,
    color: str | None = None,
):
    """Uploads a single photo for one shoe. Use POST /{product_id}/images/bulk to add several at once."""
    service = ProductService(db)
    return await service.add_image(product_id, file, is_primary, color)


@router.post("/{product_id}/images/bulk", response_model=list[ProductImageOut], status_code=201, include_in_schema=False)
async def upload_images_bulk(
    product_id: int,
    db: DbSession,
    _: CurrentAdmin,
    files: list[UploadFile] = File(...),
    color: str | None = None,
):
    """Uploads several photos at once for the same shoe — e.g. all angles of one design/color."""
    service = ProductService(db)
    return await service.add_images(product_id, files, color)


@router.put("/{product_id}/images/{image_id}/primary", response_model=Message, include_in_schema=False)
async def set_primary_image(product_id: int, image_id: int, db: DbSession, _: CurrentAdmin):
    service = ProductService(db)
    await service.set_primary_image(product_id, image_id)
    return Message(message="تصویر اصلی به‌روزرسانی شد")


@router.delete("/images/{image_id}", response_model=Message, include_in_schema=False)
async def delete_image(image_id: int, db: DbSession, _: CurrentAdmin):
    service = ProductService(db)
    await service.delete_image(image_id)
    return Message(message="تصویر حذف شد")
