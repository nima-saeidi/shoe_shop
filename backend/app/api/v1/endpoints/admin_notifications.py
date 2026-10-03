from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.admin import LogEntryOut
from app.services.log_service import LogService

router = APIRouter()


@router.get("", response_model=list[LogEntryOut], include_in_schema=False)
async def list_notifications(db: DbSession, _: CurrentAdmin, limit: int = Query(30, ge=1, le=100)):
    """Latest customer-triggered events (new tickets/replies, orders, returns, wholesale
    requests), newest first. Read/unread state is tracked by the admin client."""
    items = await LogService(db).latest_notifications(limit)
    return [
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
            ip_address=None,
            created_at=log.created_at,
        )
        for log in items
    ]
