from fastapi import APIRouter, Form, HTTPException, Request
from fastapi.responses import RedirectResponse

from app.account.deps import DbSession
from app.account.templating import flash, templates
from app.core.exceptions import AppException, InvalidCredentialsError
from app.core.rate_limit import login_rate_limiter
from app.models.log import LogLevel
from app.schemas.user import UserCreate, UserLogin
from app.services.auth_service import AuthService
from app.services.log_service import CATEGORY_AUTH, CATEGORY_SECURITY, LogService

router = APIRouter()


def _client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


@router.get("/login")
async def login_page(request: Request):
    if request.session.get("customer_user_id"):
        return RedirectResponse(url="/account", status_code=302)
    return templates.TemplateResponse("login.html", {"request": request})


@router.post("/login")
async def login_submit(request: Request, db: DbSession, email: str = Form(...), password: str = Form(...)):
    log_service = LogService(db)
    ip = _client_ip(request)

    try:
        login_rate_limiter.check(request, extra=email.lower())
    except HTTPException as exc:
        await log_service.log(
            CATEGORY_SECURITY,
            "customer_login_rate_limited",
            f"تلاش‌های ورود ناموفق بیش از حد برای «{email}» — موقتاً مسدود شد",
            level=LogLevel.WARNING,
            ip_address=ip,
        )
        await db.commit()
        return templates.TemplateResponse("login.html", {"request": request, "error": exc.detail}, status_code=429)

    service = AuthService(db)
    try:
        user = await service.authenticate(UserLogin(email=email, password=password))
    except InvalidCredentialsError as exc:
        await log_service.log(
            CATEGORY_SECURITY,
            "customer_login_failed",
            f"ورود ناموفق مشتری با ایمیل «{email}»",
            level=LogLevel.WARNING,
            ip_address=ip,
        )
        await db.commit()
        return templates.TemplateResponse("login.html", {"request": request, "error": exc.detail}, status_code=401)

    login_rate_limiter.reset(request, extra=email.lower())
    await log_service.log(CATEGORY_AUTH, "customer_login", f"ورود مشتری «{user.full_name}»", actor=user, ip_address=ip)
    await db.commit()

    request.session["customer_user_id"] = user.id
    request.session["customer_user_name"] = user.full_name
    flash(request, f"خوش آمدید، {user.full_name}!")
    return RedirectResponse(url="/account", status_code=302)


@router.get("/register")
async def register_page(request: Request):
    if request.session.get("customer_user_id"):
        return RedirectResponse(url="/account", status_code=302)
    return templates.TemplateResponse("register.html", {"request": request})


@router.post("/register")
async def register_submit(
    request: Request,
    db: DbSession,
    full_name: str = Form(...),
    email: str = Form(...),
    phone_number: str = Form(""),
    password: str = Form(...),
):
    service = AuthService(db)
    log_service = LogService(db)
    try:
        user = await service.register(
            UserCreate(full_name=full_name, email=email, phone_number=phone_number or None, password=password)
        )
    except AppException as exc:
        return templates.TemplateResponse("register.html", {"request": request, "error": exc.detail}, status_code=400)

    await log_service.log(
        CATEGORY_AUTH, "customer_register", f"ثبت‌نام مشتری جدید «{user.full_name}»", actor=user, ip_address=_client_ip(request)
    )
    await db.commit()

    request.session["customer_user_id"] = user.id
    request.session["customer_user_name"] = user.full_name
    flash(request, "ثبت‌نام شما با موفقیت انجام شد!")
    return RedirectResponse(url="/account", status_code=302)


@router.get("/logout")
async def logout(request: Request):
    request.session.pop("customer_user_id", None)
    request.session.pop("customer_user_name", None)
    return RedirectResponse(url="/account/login", status_code=302)
