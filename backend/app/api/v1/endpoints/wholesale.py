from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, CurrentUser, DbSession
from app.schemas.user import UserOut
from app.schemas.wholesale import WholesaleDecision, WholesaleRequestOut, WholesaleUpgradeRequest
from app.services.wholesale_service import WholesaleService

router = APIRouter()


@router.post("/request", response_model=UserOut, status_code=201)
async def request_wholesale_upgrade(data: WholesaleUpgradeRequest, current_user: CurrentUser, db: DbSession):
    service = WholesaleService(db)
    return await service.request_upgrade(current_user.id, data.company_name)


@router.get("", response_model=list[WholesaleRequestOut], include_in_schema=False)
async def list_wholesale_requests(
    db: DbSession,
    _: CurrentAdmin,
    status: str = Query("pending"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    service = WholesaleService(db)
    return await service.list_requests(status=status, offset=(page - 1) * page_size, limit=page_size)


@router.post("/{user_id}/decision", response_model=UserOut, include_in_schema=False)
async def decide_wholesale_request(user_id: int, data: WholesaleDecision, db: DbSession, current_admin: CurrentAdmin):
    service = WholesaleService(db)
    return await service.decide(user_id, data.approve, actor_id=current_admin.id)
