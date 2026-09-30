from fastapi import APIRouter, Request

from app.account.deps import CurrentCustomer, DbSession
from app.account.templating import templates
from app.services.wallet_service import WalletService

router = APIRouter()


@router.get("")
async def wallet_page(request: Request, db: DbSession, current_customer: CurrentCustomer):
    service = WalletService(db)
    balance = await service.get_balance(current_customer.id)
    transactions = await service.list_transactions(current_customer.id, limit=100)
    return templates.TemplateResponse(
        "wallet.html",
        {
            "request": request,
            "current_customer": current_customer,
            "balance": balance,
            "transactions": transactions,
            "active_page": "wallet",
        },
    )
