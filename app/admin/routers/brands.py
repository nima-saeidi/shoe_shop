from fastapi import APIRouter, File, Form, Request, UploadFile
from fastapi.responses import RedirectResponse

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import flash, templates
from app.core.exceptions import AppException
from app.schemas.brand import BrandCreate, BrandUpdate
from app.services.brand_service import BrandService
from app.services.media_service import save_uploaded_image

router = APIRouter()


@router.get("")
async def list_brands(request: Request, db: DbSession, current_admin: CurrentAdminUser, page: int = 1):
    service = BrandService(db)
    items, total = await service.list_brands(offset=(page - 1) * 20, limit=20)
    return templates.TemplateResponse(
        "brands/list.html",
        {
            "request": request,
            "current_admin": current_admin,
            "brands": items,
            "total": total,
            "page": page,
            "active_page": "brands",
        },
    )


@router.get("/new")
async def new_brand_form(request: Request, current_admin: CurrentAdminUser):
    return templates.TemplateResponse(
        "brands/form.html", {"request": request, "current_admin": current_admin, "brand": None, "active_page": "brands"}
    )


@router.post("/new")
async def create_brand(
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    name: str = Form(...),
    logo_url: str = Form(""),
    is_active: bool = Form(False),
    logo_file: UploadFile | None = File(default=None),
):
    service = BrandService(db)
    try:
        final_logo_url = logo_url or None
        if logo_file is not None and logo_file.filename:
            final_logo_url = await save_uploaded_image(logo_file, subdir="brands")
        await service.create_brand(BrandCreate(name=name, logo_url=final_logo_url, is_active=is_active), actor_id=current_admin.id)
        flash(request, "برند با موفقیت ایجاد شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/brands", status_code=302)


@router.get("/{brand_id}/edit")
async def edit_brand_form(brand_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = BrandService(db)
    brand = await service.get_brand(brand_id)
    return templates.TemplateResponse(
        "brands/form.html", {"request": request, "current_admin": current_admin, "brand": brand, "active_page": "brands"}
    )


@router.post("/{brand_id}/edit")
async def update_brand(
    brand_id: int,
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    name: str = Form(...),
    logo_url: str = Form(""),
    is_active: bool = Form(False),
):
    service = BrandService(db)
    try:
        await service.update_brand(brand_id, BrandUpdate(name=name, logo_url=logo_url or None, is_active=is_active), actor_id=current_admin.id)
        flash(request, "برند با موفقیت به‌روزرسانی شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/brands", status_code=302)


@router.post("/{brand_id}/logo")
async def upload_brand_logo(
    brand_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser, file: UploadFile = File(...)
):
    service = BrandService(db)
    try:
        await service.upload_logo(brand_id, file, actor_id=current_admin.id)
        flash(request, "لوگو با موفقیت آپلود شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/admin/brands/{brand_id}/edit", status_code=302)


@router.post("/{brand_id}/delete")
async def delete_brand(brand_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = BrandService(db)
    try:
        await service.delete_brand(brand_id, actor_id=current_admin.id)
        flash(request, "برند حذف شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/brands", status_code=302)
