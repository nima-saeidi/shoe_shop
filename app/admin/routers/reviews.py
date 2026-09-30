from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import flash, templates
from app.core.exceptions import AppException
from app.models.review import Review
from app.services.review_service import ReviewService

router = APIRouter()


@router.get("")
async def list_reviews(request: Request, db: DbSession, current_admin: CurrentAdminUser, page: int = 1):
    limit = 20
    stmt = (
        select(Review)
        .options(selectinload(Review.product), selectinload(Review.user))
        .order_by(Review.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(stmt)
    reviews = result.scalars().all()
    return templates.TemplateResponse(
        "reviews/list.html",
        {"request": request, "current_admin": current_admin, "reviews": reviews, "page": page, "active_page": "reviews"},
    )


@router.post("/{review_id}/approve")
async def approve_review(review_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = ReviewService(db)
    try:
        await service.moderate_review(review_id, True, actor_id=current_admin.id)
        flash(request, "نظر تایید شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/reviews", status_code=302)


@router.post("/{review_id}/reject")
async def reject_review(review_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = ReviewService(db)
    try:
        await service.moderate_review(review_id, False, actor_id=current_admin.id)
        flash(request, "نظر رد شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/reviews", status_code=302)


@router.post("/{review_id}/delete")
async def delete_review(review_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = ReviewService(db)
    try:
        await service.delete_review(review_id, current_admin.id, is_admin=True)
        flash(request, "نظر حذف شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/reviews", status_code=302)
