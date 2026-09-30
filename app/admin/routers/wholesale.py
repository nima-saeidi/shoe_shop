from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import flash, templates
from app.core.exceptions import AppException
from app.services.wholesale_service import WholesaleService

router = APIRouter()


@router.get("")
async def list_requests(request: Request, db: DbSession, current_admin: CurrentAdminUser, status: str = "pending"):
    service = WholesaleService(db)
    requests_ = await service.list_requests(status=status, limit=100)
    return templates.TemplateResponse(
        "wholesale/list.html",
        {
            "request": request,
            "current_admin": current_admin,
            "requests": requests_,
            "status_filter": status,
            "active_page": "wholesale",
        },
    )


@router.post("/{user_id}/approve")
async def approve_request(user_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = WholesaleService(db)
    try:
        await service.decide(user_id, approve=True, actor_id=current_admin.id)
        flash(request, "درخواست همکاری عمده تایید شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/wholesale", status_code=302)


@router.post("/{user_id}/reject")
async def reject_request(user_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = WholesaleService(db)
    try:
        await service.decide(user_id, approve=False, actor_id=current_admin.id)
        flash(request, "درخواست همکاری عمده رد شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/wholesale", status_code=302)
