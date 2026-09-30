from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.common import Message
from app.schemas.user import UserOut, UserPasswordUpdate, UserUpdate
from app.services.user_service import UserService

router = APIRouter()


@router.get("/me", response_model=UserOut)
async def get_me(current_user: CurrentUser):
    return current_user


@router.put("/me", response_model=UserOut)
async def update_me(data: UserUpdate, current_user: CurrentUser, db: DbSession):
    service = UserService(db)
    return await service.update_profile(current_user.id, data)


@router.post("/me/change-password", response_model=Message)
async def change_password(data: UserPasswordUpdate, current_user: CurrentUser, db: DbSession):
    service = UserService(db)
    await service.change_password(current_user.id, data)
    return Message(message="Password updated successfully")
