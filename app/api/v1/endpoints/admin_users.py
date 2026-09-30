from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.admin import AdminUserOut, AdminUserUpdate
from app.schemas.common import Page
from app.schemas.user import UserUpdate
from app.services.user_service import UserService

router = APIRouter()


@router.get("", response_model=Page[AdminUserOut], include_in_schema=False)
async def list_users(
    db: DbSession, current_admin: CurrentAdmin, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100)
):
    service = UserService(db)
    items, total = await service.list_users(offset=(page - 1) * page_size, limit=page_size)
    pages = max((total + page_size - 1) // page_size, 1)
    return Page(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.put("/{user_id}", response_model=AdminUserOut, include_in_schema=False)
async def update_user(user_id: int, data: AdminUserUpdate, db: DbSession, current_admin: CurrentAdmin):
    service = UserService(db)
    return await service.admin_update_user(
        user_id, UserUpdate(**data.model_dump(exclude_unset=True)), actor_id=current_admin.id
    )
