from fastapi import APIRouter

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.order import OrderOut
from app.services.order_service import OrderService

router = APIRouter()


@router.get("/{order_id}", response_model=OrderOut, include_in_schema=False)
async def admin_get_order(order_id: int, db: DbSession, _: CurrentAdmin):
    """Fetch any order by id, regardless of owner — for the admin panel's order detail view."""
    service = OrderService(db)
    return await service.get_order(order_id)
