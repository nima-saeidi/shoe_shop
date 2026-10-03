from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AlreadyExistsError, InvalidCredentialsError, NotFoundError
from app.core.security import hash_password, verify_password
from app.models.log import LogLevel
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserPasswordUpdate, UserUpdate
from app.services.log_service import CATEGORY_SECURITY, CATEGORY_USER, LogService


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.log_service = LogService(db)

    async def get_profile(self, user_id: int) -> User:
        user = await self.user_repo.get(user_id)
        if not user:
            raise NotFoundError("کاربر پیدا نشد")
        return user

    async def update_profile(self, user_id: int, data: UserUpdate) -> User:
        user = await self.get_profile(user_id)
        if data.phone_number and data.phone_number != user.phone_number:
            owner = await self.user_repo.get_by_phone(data.phone_number)
            if owner and owner.id != user.id:
                raise AlreadyExistsError("این شماره موبایل قبلاً برای حساب دیگری ثبت شده است")
        await self.user_repo.update(user, **data.model_dump(exclude_unset=True, exclude={"role"}))
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def change_password(self, user_id: int, data: UserPasswordUpdate) -> None:
        user = await self.get_profile(user_id)
        if not verify_password(data.current_password, user.hashed_password):
            raise InvalidCredentialsError("رمز عبور فعلی اشتباه است")
        user.hashed_password = hash_password(data.new_password)
        await self.log_service.log(
            CATEGORY_SECURITY, "password_changed", f"«{user.full_name}» رمز عبور خود را تغییر داد", actor_id=user_id
        )
        await self.db.commit()

    async def list_users(self, offset: int, limit: int):
        items = await self.user_repo.list(offset=offset, limit=limit)
        total = await self.user_repo.count()
        return items, total

    async def admin_update_user(self, user_id: int, data: UserUpdate, actor_id: int | None = None) -> User:
        user = await self.get_profile(user_id)
        payload = data.model_dump(exclude_unset=True)
        await self.user_repo.update(user, **payload)

        if "role" in payload:
            role_value = payload["role"].value if hasattr(payload["role"], "value") else payload["role"]
            await self.log_service.log(
                CATEGORY_USER,
                "user_role_changed",
                f"نقش «{user.full_name}» به «{role_value}» تغییر کرد",
                level=LogLevel.WARNING,
                actor_id=actor_id,
                target_type="user",
                target_id=user_id,
            )
        if "is_active" in payload:
            await self.log_service.log(
                CATEGORY_USER,
                "user_active_toggled",
                f"حساب «{user.full_name}» {'فعال' if payload['is_active'] else 'غیرفعال'} شد",
                level=LogLevel.WARNING,
                actor_id=actor_id,
                target_type="user",
                target_id=user_id,
            )

        await self.db.commit()
        await self.db.refresh(user)
        return user
