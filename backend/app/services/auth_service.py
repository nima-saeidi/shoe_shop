from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AlreadyExistsError, InvalidCredentialsError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole
from app.repositories.user_repo import UserRepository
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, data: UserCreate) -> User:
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise AlreadyExistsError("کاربری با این ایمیل قبلاً ثبت‌نام کرده است")
        if data.phone_number and await self.user_repo.get_by_phone(data.phone_number):
            raise AlreadyExistsError("این شماره موبایل قبلاً برای حساب دیگری ثبت شده است")

        user = await self.user_repo.create(
            full_name=data.full_name,
            email=data.email,
            phone_number=data.phone_number,
            hashed_password=hash_password(data.password),
            role=UserRole.CUSTOMER,
        )
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def authenticate(self, credentials: UserLogin) -> User:
        user = await self.user_repo.get_by_email(credentials.email)
        if not user or not verify_password(credentials.password, user.hashed_password):
            raise InvalidCredentialsError("ایمیل یا رمز عبور اشتباه است")
        if not user.is_active:
            raise InvalidCredentialsError("این حساب کاربری غیرفعال شده است")
        return user

    async def authenticate_admin(self, credentials: UserLogin) -> User:
        user = await self.authenticate(credentials)
        if not user.is_admin:
            raise InvalidCredentialsError("شما دسترسی به پنل مدیریت ندارید")
        return user

    def issue_tokens(self, user: User) -> Token:
        return Token(
            access_token=create_access_token(str(user.id), {"role": user.role.value}),
            refresh_token=create_refresh_token(str(user.id)),
        )

    async def refresh_access_token(self, refresh_token: str) -> Token:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise InvalidCredentialsError("نشست شما منقضی شده است؛ دوباره وارد شوید")
        user = await self.user_repo.get(int(payload["sub"]))
        if not user or not user.is_active:
            raise InvalidCredentialsError("کاربر پیدا نشد یا غیرفعال است")
        return self.issue_tokens(user)
