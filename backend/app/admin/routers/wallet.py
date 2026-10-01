from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import flash, templates
from app.core.exceptions import AppException
from app.models.user import User
from app.services.wallet_service import WalletService

router = APIRouter()


@router.get("")
async def wallet_search(request: Request, db: DbSession, current_admin: CurrentAdminUser, q: str | None = None):
    users = []
    if q:
        stmt = select(User).where((User.email.ilike(f"%{q}%")) | (User.phone_number.ilike(f"%{q}%"))).limit(20)
        result = await db.execute(stmt)
        users = result.scalars().all()
    return templates.TemplateResponse(
        "wallet/search.html",
        {"request": request, "current_admin": current_admin, "users": users, "q": q or "", "active_page": "wallet"},
    )


@router.get("/{user_id}")
async def wallet_detail(user_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = WalletService(db)
    user = await service.user_repo.get(user_id)
    transactions = await service.list_transactions(user_id, limit=100)
    return templates.TemplateResponse(
        "wallet/detail.html",
        {
            "request": request,
            "current_admin": current_admin,
            "wallet_user": user,
            "transactions": transactions,
            "active_page": "wallet",
        },
    )


@router.post("/{user_id}/topup")
async def topup(
    user_id: int,
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    amount: float = Form(...),
    description: str = Form(""),
):
    service = WalletService(db)
    try:
        await service.topup(user_id, amount, description or None, current_admin.id)
        flash(request, "کیف پول با موفقیت شارژ شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/admin/wallet/{user_id}", status_code=302)
