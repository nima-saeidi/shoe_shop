from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.admin.router import admin_router
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.logging_config import setup_logging

setup_logging()

app = FastAPI(title=settings.PROJECT_NAME)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# Only ever echo back explicitly allow-listed origins. "*" combined with
# allow_credentials=True is both rejected by browsers and a common misconfiguration
# that (on permissive clients) would let any site make authenticated requests here.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET_KEY,
    same_site="lax",
    https_only=settings.ENVIRONMENT == "production",
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


# Framework-generated errors (404 for unknown URLs, 405, ...) come with English text.
_HTTP_STATUS_FA = {
    400: "درخواست نامعتبر است",
    401: "احراز هویت نامعتبر است؛ دوباره وارد شوید",
    403: "شما اجازه این کار را ندارید",
    404: "مورد درخواستی پیدا نشد",
    405: "این روش درخواست مجاز نیست",
    413: "حجم درخواست بیش از حد مجاز است",
    429: "تعداد درخواست‌ها بیش از حد مجاز است؛ کمی بعد دوباره تلاش کنید",
    500: "خطای داخلی سرور",
}


@app.exception_handler(StarletteHTTPException)
async def login_redirect_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 307 and (request.url.path.startswith("/admin")):
        return RedirectResponse(url=exc.detail, status_code=302)
    detail = exc.detail
    # Only replace Starlette's stock English phrases; our own (already Persian) details pass through.
    if not isinstance(detail, str) or detail.isascii():
        detail = _HTTP_STATUS_FA.get(exc.status_code, detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": detail}, headers=getattr(exc, "headers", None))


_FIELD_FA = {
    "full_name": "نام و نام خانوادگی", "email": "ایمیل", "password": "رمز عبور", "new_password": "رمز جدید",
    "current_password": "رمز فعلی", "phone_number": "شماره تماس", "name": "نام", "price": "قیمت",
    "discount_price": "قیمت با تخفیف", "sku": "کد کالا", "address_line": "نشانی", "city": "شهر",
    "postal_code": "کد پستی", "quantity": "تعداد", "code": "کد", "category_id": "دسته‌بندی", "brand_id": "برند",
    "shipping_full_name": "نام گیرنده", "shipping_phone": "شماره تماس", "shipping_address": "نشانی",
    "shipping_city": "شهر", "shipping_postal_code": "کد پستی", "stock_quantity": "موجودی", "size": "سایز",
    "color": "رنگ", "discount_value": "مقدار تخفیف", "file": "فایل", "files": "فایل‌ها",
}


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    messages = []
    for err in exc.errors():
        field = next((str(x) for x in reversed(err.get("loc", ())) if isinstance(x, str) and x not in ("body", "query", "path")), "")
        label = _FIELD_FA.get(field, field)
        kind = err.get("type", "")
        ctx = err.get("ctx") or {}
        if kind == "missing":
            text = f"فیلد «{label}» الزامی است"
        elif kind.startswith("string_too_short"):
            text = f"«{label}» باید حداقل {ctx.get('min_length', '')} کاراکتر باشد"
        elif kind.startswith("string_too_long"):
            text = f"«{label}» نباید بیش از {ctx.get('max_length', '')} کاراکتر باشد"
        elif "value_error" in kind and field == "email":
            text = "ایمیل واردشده معتبر نیست"
        elif kind in ("greater_than", "greater_than_equal"):
            text = f"«{label}» باید بزرگ‌تر از {ctx.get('gt', ctx.get('ge', ''))} باشد" if kind == "greater_than" else f"«{label}» نباید کمتر از {ctx.get('ge', '')} باشد"
        elif kind in ("less_than", "less_than_equal"):
            text = f"«{label}» مقدار مجاز را رد کرده است"
        elif "type" in kind or "parsing" in kind:
            text = f"مقدار «{label}» نامعتبر است"
        else:
            text = f"مقدار «{label}» نامعتبر است" if label else "اطلاعات ارسالی نامعتبر است"
        messages.append(text)
    detail = "؛ ".join(dict.fromkeys(messages)) or "اطلاعات ارسالی نامعتبر است"
    return JSONResponse(status_code=422, content={"detail": detail})


app.include_router(api_router, prefix=settings.API_V1_PREFIX)
# The admin panel is server-rendered HTML, not a JSON API — keep it out of the
# public Swagger docs entirely (only the customer/site-facing JSON API should show there).
app.include_router(admin_router, include_in_schema=False)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}
