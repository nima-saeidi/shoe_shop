from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.account.router import account_router
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


@app.exception_handler(StarletteHTTPException)
async def login_redirect_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 307 and (request.url.path.startswith("/admin") or request.url.path.startswith("/account")):
        return RedirectResponse(url=exc.detail, status_code=302)
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


app.include_router(api_router, prefix=settings.API_V1_PREFIX)
# The admin panel and the customer account panel are server-rendered HTML, not a
# JSON API — keep them out of the public Swagger docs entirely (only the
# customer/site-facing JSON API should show there).
app.include_router(admin_router, include_in_schema=False)
app.include_router(account_router, include_in_schema=False)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}
