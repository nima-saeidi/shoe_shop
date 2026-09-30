from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError
from app.models.user import User, UserRole, WholesaleStatus
from app.repositories.user_repo import UserRepository
from app.services.log_service import CATEGORY_WHOLESALE, LogService
from app.services.sms_service import sms_service


class WholesaleService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.log_service = LogService(db)

    async def request_upgrade(self, user_id: int, company_name: str) -> User:
        user = await self.user_repo.get(user_id)
        if not user:
            raise NotFoundError("User not found")
        if user.wholesale_status == WholesaleStatus.PENDING:
            raise BadRequestError("A wholesale request is already pending")
        if user.role == UserRole.WHOLESALE and user.wholesale_status == WholesaleStatus.APPROVED:
            raise BadRequestError("You are already an approved wholesale customer")

        user.company_name = company_name
        user.wholesale_status = WholesaleStatus.PENDING
        user.wholesale_requested_at = datetime.now(timezone.utc)
        await self.log_service.log(
            CATEGORY_WHOLESALE,
            "wholesale_requested",
            f"«{user.full_name}» درخواست همکاری عمده برای «{company_name}» ثبت کرد",
            actor_id=user_id,
            target_type="user",
            target_id=user_id,
        )
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def list_requests(self, status: str | None = "pending", offset: int = 0, limit: int = 50):
        stmt = select(User).where(User.wholesale_status.isnot(None))
        if status and status != "all":
            stmt = stmt.where(User.wholesale_status == status)
        else:
            stmt = stmt.where(User.wholesale_status != WholesaleStatus.NONE)
        stmt = stmt.order_by(User.wholesale_requested_at.desc().nullslast()).offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def decide(self, user_id: int, approve: bool, actor_id: int | None = None) -> User:
        user = await self.user_repo.get(user_id)
        if not user:
            raise NotFoundError("User not found")
        if user.wholesale_status != WholesaleStatus.PENDING:
            raise BadRequestError("This user has no pending wholesale request")

        user.wholesale_status = WholesaleStatus.APPROVED if approve else WholesaleStatus.REJECTED
        if approve:
            user.role = UserRole.WHOLESALE

        await self.log_service.log(
            CATEGORY_WHOLESALE,
            "wholesale_approved" if approve else "wholesale_rejected",
            f"درخواست همکاری عمده «{user.full_name}» {'تایید' if approve else 'رد'} شد",
            actor_id=actor_id,
            target_type="user",
            target_id=user_id,
        )
        await self.db.commit()
        await self.db.refresh(user)

        if user.phone_number:
            await sms_service.notify_wholesale_approval(user.phone_number, approve)
        return user
