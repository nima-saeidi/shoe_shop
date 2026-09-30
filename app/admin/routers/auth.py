from fastapi import APIRouter, Form, HTTPException, Request
from fastapi.responses import RedirectResponse

from app.admin.deps import DbSession
from app.admin.templating import flash, templates
from app.core.exceptions import InvalidCredentialsError
from app.core.rate_limit import login_rate_limiter
from app.models.log import LogLevel
from app.schemas.user import UserLogin
from app.services.auth_service import AuthService
from app.services.log_service import CATEGORY_AUTH, CATEGORY_SECURITY, LogService

router = APIRouter()


def _client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


@router.get("/login")
async def login_page(request: Request):
    if request.session.get("admin_user_id"):
        return RedirectResponse(url="/admin", status_code=302)
    return templates.TemplateResponse("login.html", {"request": request})


@router.post("/login")
async def login_submit(
    request: Request,
    db: DbSession,
    email: str = Form(...),
    password: str = Form(...),
):
    log_service = LogService(db)
    ip = _client_ip(request)

    try:
        login_rate_limiter.check(request, extra=email.lower())
    except HTTPException as exc:
        await log_service.log(
            CATEGORY_SECURITY,
            "admin_login_rate_limited",
            f"تلاش‌های ورود ناموفق بیش از حد برای «{email}» — موقتاً مسدود شد",
            level=LogLevel.WARNING,
            ip_address=ip,
        )
        await db.commit()
        return templates.TemplateResponse(
            "login.html", {"request": request, "error": exc.detail}, status_code=429
        )

    service = AuthService(db)
    try:
        user = await service.authenticate_admin(UserLogin(email=email, password=password))
    except InvalidCredentialsError as exc:
        await log_service.log(
            CATEGORY_SECURITY,
            "admin_login_failed",
            f"ورود ناموفق به پنل ادمین با ایمیل «{email}»",
            level=LogLevel.WARNING,
            ip_address=ip,
        )
        await db.commit()
        return templates.TemplateResponse(
            "login.html", {"request": request, "error": exc.detail}, status_code=401
        )

    login_rate_limiter.reset(request, extra=email.lower())
    await log_service.log(
        CATEGORY_AUTH, "admin_login", f"ورود ادمین «{user.full_name}» به پنل مدیریت", actor=user, ip_address=ip
    )
    await db.commit()

    request.session["admin_user_id"] = user.id
    request.session["admin_user_name"] = user.full_name
    flash(request, f"خوش آمدید، {user.full_name}!")
    return RedirectResponse(url="/admin", status_code=302)


@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/admin/login", status_code=302)
