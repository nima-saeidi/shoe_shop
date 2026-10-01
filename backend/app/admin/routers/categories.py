from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import flash, templates
from app.core.exceptions import AppException
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.services.category_service import CategoryService

router = APIRouter()


@router.get("")
async def list_categories(request: Request, db: DbSession, current_admin: CurrentAdminUser, page: int = 1):
    service = CategoryService(db)
    items, total = await service.list_categories(offset=(page - 1) * 20, limit=20)
    return templates.TemplateResponse(
        "categories/list.html",
        {
            "request": request,
            "current_admin": current_admin,
            "categories": items,
            "total": total,
            "page": page,
            "active_page": "categories",
        },
    )


@router.get("/new")
async def new_category_form(request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = CategoryService(db)
    all_categories, _ = await service.list_categories(limit=200)
    return templates.TemplateResponse(
        "categories/form.html",
        {"request": request, "current_admin": current_admin, "category": None, "all_categories": all_categories, "active_page": "categories"},
    )


@router.post("/new")
async def create_category(
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    name: str = Form(...),
    description: str = Form(""),
    parent_id: str = Form(""),
    is_active: bool = Form(False),
):
    service = CategoryService(db)
    try:
        await service.create_category(
            CategoryCreate(
                name=name,
                description=description or None,
                parent_id=int(parent_id) if parent_id else None,
                is_active=is_active,
            ),
            actor_id=current_admin.id,
        )
        flash(request, "دسته‌بندی با موفقیت ایجاد شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/categories", status_code=302)


@router.get("/{category_id}/edit")
async def edit_category_form(
    category_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser
):
    service = CategoryService(db)
    category = await service.get_category(category_id)
    all_categories, _ = await service.list_categories(limit=200)
    return templates.TemplateResponse(
        "categories/form.html",
        {
            "request": request,
            "current_admin": current_admin,
            "category": category,
            "all_categories": [c for c in all_categories if c.id != category_id],
            "active_page": "categories",
        },
    )


@router.post("/{category_id}/edit")
async def update_category(
    category_id: int,
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    name: str = Form(...),
    description: str = Form(""),
    parent_id: str = Form(""),
    is_active: bool = Form(False),
):
    service = CategoryService(db)
    try:
        await service.update_category(
            category_id,
            CategoryUpdate(
                name=name,
                description=description or None,
                parent_id=int(parent_id) if parent_id else None,
                is_active=is_active,
            ),
            actor_id=current_admin.id,
        )
        flash(request, "دسته‌بندی با موفقیت به‌روزرسانی شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/categories", status_code=302)


@router.post("/{category_id}/delete")
async def delete_category(category_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = CategoryService(db)
    try:
        await service.delete_category(category_id, actor_id=current_admin.id)
        flash(request, "دسته‌بندی حذف شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/categories", status_code=302)
