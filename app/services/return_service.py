from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BadRequestError, NotFoundError
from app.models.order import OrderItem, OrderStatus
from app.models.return_request import ReturnRequest, ReturnStatus
from app.repositories.return_repo import ReturnRepository
from app.schemas.return_request import ReturnRequestCreate
from app.services.log_service import CATEGORY_RETURN, LogService
from app.services.wallet_service import WalletService


class ReturnService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ReturnRepository(db)
        self.wallet_service = WalletService(db)
        self.log_service = LogService(db)

    async def create_return(self, user_id: int, data: ReturnRequestCreate) -> ReturnRequest:
        stmt = (
            select(OrderItem)
            .where(OrderItem.id == data.order_item_id)
            .options(selectinload(OrderItem.order))
        )
        order_item = (await self.db.execute(stmt)).scalar_one_or_none()
        if not order_item:
            raise NotFoundError("Order item not found")
        if order_item.order.user_id != user_id:
            raise NotFoundError("Order item not found")
        if order_item.order.status != OrderStatus.DELIVERED:
            raise BadRequestError("Only delivered orders can be returned")

        existing = await self.db.execute(select(ReturnRequest).where(ReturnRequest.order_item_id == data.order_item_id))
        if existing.scalar_one_or_none():
            raise BadRequestError("A return request already exists for this item")

        return_request = await self.repo.create(
            order_id=order_item.order_id,
            order_item_id=data.order_item_id,
            user_id=user_id,
            reason=data.reason,
            description=data.description,
        )
        await self.log_service.log(
            CATEGORY_RETURN,
            "return_requested",
            f"درخواست مرجوعی برای «{order_item.product_name}» (سفارش #{order_item.order_id}) ثبت شد",
            actor_id=user_id,
            target_type="order_item",
            target_id=order_item.id,
        )
        await self.db.commit()
        return await self.repo.get(return_request.id)

    async def list_for_user(self, user_id: int, offset: int = 0, limit: int = 50):
        return await self.repo.list_for_user(user_id, offset, limit)

    async def list_all(self, offset: int = 0, limit: int = 50, status: str | None = None):
        return await self.repo.list_all(offset, limit, status)

    async def get(self, return_id: int) -> ReturnRequest:
        item = await self.repo.get(return_id)
        if not item:
            raise NotFoundError("Return request not found")
        return item

    async def moderate(
        self,
        return_id: int,
        status: ReturnStatus,
        admin_note: str | None,
        refund_to_wallet: bool = True,
        actor_id: int | None = None,
    ) -> ReturnRequest:
        return_request = await self.get(return_id)
        return_request.status = status
        return_request.admin_note = admin_note

        if status == ReturnStatus.COMPLETED and refund_to_wallet:
            amount = float(return_request.order_item.unit_price) * return_request.order_item.quantity
            await self.wallet_service.refund(return_request.user_id, amount, return_request.order_id, admin_id=actor_id)

        await self.log_service.log(
            CATEGORY_RETURN,
            "return_moderated",
            f"درخواست مرجوعی #{return_id} به وضعیت «{status.value}» تغییر کرد",
            actor_id=actor_id,
            target_type="return_request",
            target_id=return_id,
        )
        await self.db.commit()
        await self.db.refresh(return_request)
        return return_request
