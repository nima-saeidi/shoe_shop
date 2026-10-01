from fastapi import APIRouter

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.support import TicketOut
from app.services.ticket_service import TicketService

router = APIRouter()


@router.get("/{ticket_id}", response_model=TicketOut, include_in_schema=False)
async def admin_get_ticket(ticket_id: int, db: DbSession, _: CurrentAdmin):
    """Fetch any customer's ticket by id — for the admin panel (the customer-facing
    GET /tickets/{id} is restricted to the ticket's own owner)."""
    service = TicketService(db)
    return await service.get(ticket_id)
