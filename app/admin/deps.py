from typing import Annotated

from fastapi import Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.database import get_db
from app.models.user import User
from app.repositories.user_repo import UserRepository

DbSession = Annotated[AsyncSession, Depends(get_db)]


class AdminRedirect(StarletteHTTPException):
    def __init__(self, url: str = "/admin/login"):
        super().__init__(status_code=307, detail=url)


async def get_current_admin_user(request: Request, db: DbSession) -> User:
    user_id = request.session.get("admin_user_id")
    if not user_id:
        raise AdminRedirect()
    user = await UserRepository(db).get(user_id)
    if not user or not user.is_active or not user.is_admin:
        request.session.clear()
        raise AdminRedirect()
    return user


CurrentAdminUser = Annotated[User, Depends(get_current_admin_user)]
