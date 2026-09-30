from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AlreadyExistsError, NotFoundError
from app.models.review import Review
from app.repositories.product_repo import ProductRepository
from app.repositories.review_repo import ReviewRepository
from app.schemas.review import ReviewCreate
from app.services.log_service import CATEGORY_REVIEW, LogService


class ReviewService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ReviewRepository(db)
        self.product_repo = ProductRepository(db)
        self.log_service = LogService(db)

    async def list_for_product(self, product_id: int, offset: int = 0, limit: int = 20):
        return await self.repo.list_for_product(product_id, offset, limit)

    async def create_review(self, product_id: int, user_id: int, data: ReviewCreate) -> Review:
        product = await self.product_repo.get(product_id)
        if not product:
            raise NotFoundError("Product not found")
        if await self.repo.get_by_product_and_user(product_id, user_id):
            raise AlreadyExistsError("You have already reviewed this product")
        review = await self.repo.create(product_id=product_id, user_id=user_id, **data.model_dump())
        await self.db.commit()
        await self.db.refresh(review)
        return review

    async def delete_review(self, review_id: int, user_id: int, is_admin: bool = False) -> None:
        review = await self.repo.get(review_id)
        if not review:
            raise NotFoundError("Review not found")
        if review.user_id != user_id and not is_admin:
            raise NotFoundError("Review not found")
        await self.repo.delete(review)
        if is_admin:
            await self.log_service.log(
                CATEGORY_REVIEW, "review_deleted", f"نظر #{review_id} توسط ادمین حذف شد", actor_id=user_id,
                target_type="review", target_id=review_id,
            )
        await self.db.commit()

    async def moderate_review(self, review_id: int, is_approved: bool, actor_id: int | None = None) -> Review:
        review = await self.repo.get(review_id)
        if not review:
            raise NotFoundError("Review not found")
        review.is_approved = is_approved
        await self.log_service.log(
            CATEGORY_REVIEW,
            "review_approved" if is_approved else "review_rejected",
            f"نظر #{review_id} {'تایید' if is_approved else 'رد'} شد",
            actor_id=actor_id,
            target_type="review",
            target_id=review_id,
        )
        await self.db.commit()
        await self.db.refresh(review)
        return review
