from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, CurrentUser, DbSession
from app.schemas.return_request import ReturnRequestCreate, ReturnRequestModerate, ReturnRequestOut
from app.services.return_service import ReturnService

router = APIRouter()


@router.post("", response_model=ReturnRequestOut, status_code=201)
async def create_return(data: ReturnRequestCreate, current_user: CurrentUser, db: DbSession):
    service = ReturnService(db)
    return await service.create_return(current_user.id, data)


@router.get("/my", response_model=list[ReturnRequestOut])
async def my_returns(current_user: CurrentUser, db: DbSession, page: int = Query(1, ge=1)):
    service = ReturnService(db)
    return await service.list_for_user(current_user.id, offset=(page - 1) * 20, limit=20)


@router.get("", response_model=list[ReturnRequestOut], include_in_schema=False)
async def list_all_returns(db: DbSession, _: CurrentAdmin, status: str | None = None, page: int = Query(1, ge=1)):
    service = ReturnService(db)
    return await service.list_all(offset=(page - 1) * 20, limit=20, status=status)


@router.put("/{return_id}", response_model=ReturnRequestOut, include_in_schema=False)
async def moderate_return(return_id: int, data: ReturnRequestModerate, db: DbSession, current_admin: CurrentAdmin):
    service = ReturnService(db)
    return await service.moderate(return_id, data.status, data.admin_note, actor_id=current_admin.id)
