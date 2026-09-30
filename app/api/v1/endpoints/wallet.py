from fastapi import APIRouter, Query
from sqlalchemy import or_, select

from app.api.deps import CurrentAdmin, CurrentUser, DbSession
from app.models.user import User
from app.schemas.admin import WalletUserSummaryOut
from app.schemas.wallet import WalletBalanceOut, WalletDetailOut, WalletTopupRequest, WalletTransactionOut
from app.services.user_service import UserService
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


@router.get("/users/search", response_model=list[WalletUserSummaryOut], include_in_schema=False)
async def search_wallet_users(q: str, db: DbSession, _: CurrentAdmin):
    stmt = (
        select(User)
        .where(or_(User.full_name.ilike(f"%{q}%"), User.email.ilike(f"%{q}%"), User.phone_number.ilike(f"%{q}%")))
        .limit(20)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/users/{user_id}", response_model=WalletDetailOut, include_in_schema=False)
async def get_user_wallet(user_id: int, db: DbSession, _: CurrentAdmin):
    user_service = UserService(db)
    wallet_service = WalletService(db)
    user = await user_service.get_profile(user_id)
    transactions = await wallet_service.list_transactions(user_id, limit=200)
    return WalletDetailOut(
        user_id=user.id, full_name=user.full_name, balance=float(user.wallet_balance), transactions=transactions
    )
