from datetime import datetime

from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, DbSession
from app.core.logging_config import read_recent_lines
from app.schemas.admin import LogEntryOut
from app.schemas.common import Page
from app.services.log_service import LogService

router = APIRouter()


@router.get("", response_model=Page[LogEntryOut], include_in_schema=False)
async def list_logs(
    db: DbSession,
    _: CurrentAdmin,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    category: str | None = None,
    level: str | None = None,
    q: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
):
    service = LogService(db)
    items, total = await service.search(
        offset=(page - 1) * page_size,
        limit=page_size,
        category=category,
        level=level,
        q=q,
        date_from=date_from,
        date_to=date_to,
    )
    entries = [
        LogEntryOut(
            id=log.id,
            level=log.level,
            category=log.category,
            action=log.action,
            message=log.message,
            actor_id=log.actor_id,
            actor_name=log.actor_label or (log.actor.full_name if log.actor else None),
            target_type=log.target_type,
            target_id=log.target_id,
            ip_address=log.ip_address,
            created_at=log.created_at,
        )
        for log in items
    ]
    pages = max((total + page_size - 1) // page_size, 1)
    return Page(items=entries, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/categories", response_model=list[str], include_in_schema=False)
async def list_log_categories(db: DbSession, _: CurrentAdmin):
    service = LogService(db)
    return await service.distinct_categories()


@router.get("/system", response_model=list[str], include_in_schema=False)
async def get_system_log(_: CurrentAdmin, lines: int = Query(300, ge=1, le=2000)):
    return read_recent_lines(max_lines=lines)
