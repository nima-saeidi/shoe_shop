from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import flash, templates
from app.core.exceptions import AppException
from app.models.user import UserRole
from app.schemas.user import UserUpdate
from app.services.user_service import UserService

router = APIRouter()


@router.get("")
async def list_users(request: Request, db: DbSession, current_admin: CurrentAdminUser, page: int = 1):
    service = UserService(db)
    items, total = await service.list_users(offset=(page - 1) * 20, limit=20)
    pages = max((total + 19) // 20, 1)
    return templates.TemplateResponse(
        "users/list.html",
        {
            "request": request,
            "current_admin": current_admin,
            "users": items,
            "total": total,
            "page": page,
            "pages": pages,
            "active_page": "users",
        },
    )


@router.post("/{user_id}/toggle-active")
async def toggle_active(user_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = UserService(db)
    try:
        user = await service.get_profile(user_id)
        await service.admin_update_user(user_id, UserUpdate(is_active=not user.is_active), actor_id=current_admin.id)
        flash(request, "وضعیت کاربر به‌روزرسانی شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/users", status_code=302)


@router.post("/{user_id}/set-role")
async def set_role(user_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser, role: str = Form(...)):
    service = UserService(db)
    try:
        await service.admin_update_user(user_id, UserUpdate(role=UserRole(role)), actor_id=current_admin.id)
        flash(request, "نقش کاربر به‌روزرسانی شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/users", status_code=302)
