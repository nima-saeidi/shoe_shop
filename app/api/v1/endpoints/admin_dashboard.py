from fastapi import APIRouter

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.admin import DashboardStatsOut
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("", response_model=DashboardStatsOut, include_in_schema=False)
async def get_dashboard(db: DbSession, _: CurrentAdmin):
    service = DashboardService(db)
    stats = await service.get_stats()
    stats["status_counts"] = {
        (k.value if hasattr(k, "value") else str(k)): v for k, v in stats["status_counts"].items()
    }
    return stats
