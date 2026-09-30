from fastapi import APIRouter, Request

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import templates
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("/")
async def dashboard_home(request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = DashboardService(db)
    stats = await service.get_stats()
    return templates.TemplateResponse(
        "dashboard.html",
        {"request": request, "current_admin": current_admin, "stats": stats, "active_page": "dashboard"},
    )
