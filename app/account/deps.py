from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.database import get_db
from app.models.user import User
from app.repositories.user_repo import UserRepository

DbSession = Annotated[AsyncSession, Depends(get_db)]


class AccountRedirect(StarletteHTTPException):
    def __init__(self, url: str = "/account/login"):
        super().__init__(status_code=307, detail=url)


async def get_current_customer(request: Request, db: DbSession) -> User:
    user_id = request.session.get("customer_user_id")
    if not user_id:
        raise AccountRedirect()
    user = await UserRepository(db).get(user_id)
    if not user or not user.is_active:
        request.session.pop("customer_user_id", None)
        raise AccountRedirect()
    return user


CurrentCustomer = Annotated[User, Depends(get_current_customer)]
