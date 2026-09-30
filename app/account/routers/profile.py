from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse

from app.account.deps import CurrentCustomer, DbSession
from app.account.templating import flash, templates
from app.core.exceptions import AppException
from app.schemas.user import UserPasswordUpdate, UserUpdate
from app.services.user_service import UserService
from app.services.wholesale_service import WholesaleService

router = APIRouter()


@router.get("")
async def profile_page(request: Request, current_customer: CurrentCustomer):
    return templates.TemplateResponse(
        "profile.html", {"request": request, "current_customer": current_customer, "active_page": "profile"}
    )


@router.post("")
async def update_profile(
    request: Request,
    db: DbSession,
    current_customer: CurrentCustomer,
    full_name: str = Form(...),
    phone_number: str = Form(""),
):
    service = UserService(db)
    try:
        await service.update_profile(
            current_customer.id, UserUpdate(full_name=full_name, phone_number=phone_number or None)
        )
        flash(request, "پروفایل با موفقیت به‌روزرسانی شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/account/profile", status_code=302)


@router.post("/password")
async def change_password(
    request: Request,
    db: DbSession,
    current_customer: CurrentCustomer,
    current_password: str = Form(...),
    new_password: str = Form(...),
):
    service = UserService(db)
    try:
        await service.change_password(
            current_customer.id, UserPasswordUpdate(current_password=current_password, new_password=new_password)
        )
        flash(request, "رمز عبور با موفقیت تغییر کرد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/account/profile", status_code=302)


@router.get("/wholesale")
async def wholesale_page(request: Request, current_customer: CurrentCustomer):
    return templates.TemplateResponse(
        "wholesale.html", {"request": request, "current_customer": current_customer, "active_page": "wholesale"}
    )


@router.post("/wholesale")
async def request_wholesale(
    request: Request, db: DbSession, current_customer: CurrentCustomer, company_name: str = Form(...)
):
    service = WholesaleService(db)
    try:
        await service.request_upgrade(current_customer.id, company_name)
        flash(request, "درخواست همکاری عمده شما ثبت شد و پس از بررسی نتیجه اطلاع‌رسانی می‌شود")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/account/profile/wholesale", status_code=302)
