from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.common import Message, Page
from app.schemas.review import ReviewModerate, ReviewOut
from app.services.review_service import ReviewService

router = APIRouter()


@router.get("", response_model=Page[ReviewOut], include_in_schema=False)
async def list_all_reviews(db: DbSession, _: CurrentAdmin, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100)):
    service = ReviewService(db)
    items, total = await service.list_all(offset=(page - 1) * page_size, limit=page_size)
    pages = max((total + page_size - 1) // page_size, 1)
    return Page(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.put("/{review_id}", response_model=ReviewOut, include_in_schema=False)
async def moderate_review(review_id: int, data: ReviewModerate, db: DbSession, current_admin: CurrentAdmin):
    service = ReviewService(db)
    return await service.moderate_review(review_id, data.is_approved, actor_id=current_admin.id)


@router.delete("/{review_id}", response_model=Message, include_in_schema=False)
async def delete_review_admin(review_id: int, db: DbSession, current_admin: CurrentAdmin):
    service = ReviewService(db)
    await service.delete_review(review_id, current_admin.id, is_admin=True)
    return Message(message="Review deleted")
