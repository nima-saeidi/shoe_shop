from fastapi import APIRouter, Request, status

from app.api.deps import DbSession
from app.core.exceptions import InvalidCredentialsError
from app.core.rate_limit import login_rate_limiter
from app.models.log import LogLevel
from app.schemas.token import RefreshTokenRequest, Token
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.services.auth_service import AuthService
from app.services.log_service import CATEGORY_AUTH, CATEGORY_SECURITY, LogService

router = APIRouter()


def _client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, request: Request, db: DbSession):
    service = AuthService(db)
    user = await service.register(data)
    log_service = LogService(db)
    await log_service.log(
        CATEGORY_AUTH, "api_register", f"ثبت‌نام کاربر جدید «{user.full_name}» از طریق API", actor=user, ip_address=_client_ip(request)
    )
    await db.commit()
    return user


@router.post("/login", response_model=Token)
async def login(data: UserLogin, request: Request, db: DbSession):
    log_service = LogService(db)
    ip = _client_ip(request)
    login_rate_limiter.check(request, extra=data.email.lower())

    service = AuthService(db)
    try:
        user = await service.authenticate(data)
    except InvalidCredentialsError:
        await log_service.log(
            CATEGORY_SECURITY,
            "api_login_failed",
            f"ورود ناموفق از طریق API با ایمیل «{data.email}»",
            level=LogLevel.WARNING,
            ip_address=ip,
        )
        await db.commit()
        raise

    login_rate_limiter.reset(request, extra=data.email.lower())
    await log_service.log(CATEGORY_AUTH, "api_login", f"ورود «{user.full_name}» از طریق API", actor=user, ip_address=ip)
    await db.commit()
    return service.issue_tokens(user)


@router.post("/refresh", response_model=Token)
async def refresh(data: RefreshTokenRequest, db: DbSession):
    service = AuthService(db)
    return await service.refresh_access_token(data.refresh_token)
