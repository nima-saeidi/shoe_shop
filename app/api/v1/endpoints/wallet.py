from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, CurrentUser, DbSession
from app.schemas.wallet import WalletBalanceOut, WalletTopupRequest, WalletTransactionOut
from app.services.wallet_service import WalletService

router = APIRouter()


@router.get("/balance", response_model=WalletBalanceOut)
async def get_balance(current_user: CurrentUser, db: DbSession):
    service = WalletService(db)
    balance = await service.get_balance(current_user.id)
    return WalletBalanceOut(balance=balance)


@router.get("/transactions", response_model=list[WalletTransactionOut])
async def list_transactions(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    service = WalletService(db)
    return await service.list_transactions(current_user.id, offset=(page - 1) * page_size, limit=page_size)


@router.post("/{user_id}/topup", response_model=WalletTransactionOut, status_code=201, include_in_schema=False)
async def topup_wallet(user_id: int, data: WalletTopupRequest, current_admin: CurrentAdmin, db: DbSession):
    service = WalletService(db)
    return await service.topup(user_id, data.amount, data.description, current_admin.id)
