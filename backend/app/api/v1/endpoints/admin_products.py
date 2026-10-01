from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.common import Page
from app.schemas.product import ProductOut
from app.services.product_service import ProductService

router = APIRouter()


@router.get("", response_model=Page[ProductOut], include_in_schema=False)
async def admin_list_products(
    db: DbSession,
    _: CurrentAdmin,
    q: str | None = None,
    category_id: int | None = None,
    brand_id: int | None = None,
    is_active: bool | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Same as the public product list, but can also surface inactive products for management."""
    service = ProductService(db)
    items, total = await service.search_products(
        offset=(page - 1) * page_size,
        limit=page_size,
        q=q,
        category_id=category_id,
        brand_id=brand_id,
        is_active=is_active,
        order_by="created_at_desc",
    )
    pages = max((total + page_size - 1) // page_size, 1)
    return Page(items=items, total=total, page=page, page_size=page_size, pages=pages)
