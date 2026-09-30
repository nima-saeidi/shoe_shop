from fastapi import APIRouter, Request

from app.account.deps import CurrentCustomer, DbSession
from app.account.templating import templates
from app.services.order_service import OrderService
from app.services.wallet_service import WalletService

router = APIRouter()


@router.get("/")
async def dashboard(request: Request, db: DbSession, current_customer: CurrentCustomer):
    order_service = OrderService(db)
    wallet_service = WalletService(db)

    recent_orders = await order_service.list_for_user(current_customer.id, offset=0, limit=5)
    balance = await wallet_service.get_balance(current_customer.id)

    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "current_customer": current_customer,
            "recent_orders": recent_orders,
            "wallet_balance": balance,
            "active_page": "dashboard",
        },
    )
