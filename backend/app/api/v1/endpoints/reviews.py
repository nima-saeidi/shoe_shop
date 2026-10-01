from fastapi import APIRouter, Query

from app.api.deps import CurrentUser, DbSession
from app.schemas.common import Message, Page
from app.schemas.review import ReviewCreate, ReviewOut
from app.services.review_service import ReviewService

router = APIRouter()


@router.get("/{product_id}/reviews", response_model=Page[ReviewOut])
async def list_reviews(
    product_id: int,
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    service = ReviewService(db)
    items = await service.list_for_product(product_id, offset=(page - 1) * page_size, limit=page_size)
    return Page(items=items, total=len(items), page=page, page_size=page_size, pages=1)


@router.post("/{product_id}/reviews", response_model=ReviewOut, status_code=201)
async def create_review(product_id: int, data: ReviewCreate, current_user: CurrentUser, db: DbSession):
    service = ReviewService(db)
    return await service.create_review(product_id, current_user.id, data)


@router.delete("/reviews/{review_id}", response_model=Message)
async def delete_review(review_id: int, current_user: CurrentUser, db: DbSession):
    service = ReviewService(db)
    await service.delete_review(review_id, current_user.id, is_admin=current_user.is_admin)
    return Message(message="نظر حذف شد")
