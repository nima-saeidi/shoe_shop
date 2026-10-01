from datetime import datetime

from fastapi import APIRouter, Request

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import templates
from app.core.logging_config import read_recent_lines
from app.services.log_service import LogService

router = APIRouter()


@router.get("")
async def list_logs(
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    page: int = 1,
    category: str | None = None,
    level: str | None = None,
    q: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
):
    service = LogService(db)
    page_size = 50

    df = datetime.fromisoformat(date_from) if date_from else None
    dt = datetime.fromisoformat(date_to) if date_to else None

    items, total = await service.search(
        offset=(page - 1) * page_size,
        limit=page_size,
        category=category or None,
        level=level or None,
        q=q or None,
        date_from=df,
        date_to=dt,
    )
    categories = await service.distinct_categories()
    pages = max((total + page_size - 1) // page_size, 1)

    return templates.TemplateResponse(
        "logs/list.html",
        {
            "request": request,
            "current_admin": current_admin,
            "logs": items,
            "total": total,
            "page": page,
            "pages": pages,
            "categories": categories,
            "category_filter": category or "",
            "level_filter": level or "",
            "q": q or "",
            "date_from": date_from or "",
            "date_to": date_to or "",
            "active_page": "logs",
        },
    )


@router.get("/system")
async def system_log(request: Request, current_admin: CurrentAdminUser, lines: int = 300):
    log_lines = read_recent_lines(max_lines=lines)
    return templates.TemplateResponse(
        "logs/system.html",
        {"request": request, "current_admin": current_admin, "log_lines": log_lines, "active_page": "logs"},
    )
