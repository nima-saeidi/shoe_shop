from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import flash, templates
from app.core.exceptions import AppException
from app.models.return_request import ReturnStatus
from app.services.return_service import ReturnService

router = APIRouter()


@router.get("")
async def list_returns(request: Request, db: DbSession, current_admin: CurrentAdminUser, status: str | None = None):
    service = ReturnService(db)
    items = await service.list_all(limit=100, status=status)
    return templates.TemplateResponse(
        "returns/list.html",
        {
            "request": request,
            "current_admin": current_admin,
            "returns": items,
            "status_filter": status or "",
            "active_page": "returns",
        },
    )


@router.post("/{return_id}/decision")
async def decide_return(
    return_id: int,
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    status: str = Form(...),
    admin_note: str = Form(""),
):
    service = ReturnService(db)
    try:
        await service.moderate(return_id, ReturnStatus(status), admin_note or None, actor_id=current_admin.id)
        flash(request, "وضعیت درخواست مرجوعی به‌روزرسانی شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/returns", status_code=302)
