from fastapi import APIRouter

from app.account.routers import addresses, auth, dashboard, orders, profile, returns, tickets, wallet

account_router = APIRouter(prefix="/account")

account_router.include_router(auth.router, tags=["Account Auth"])
account_router.include_router(dashboard.router, tags=["Account Dashboard"])
account_router.include_router(profile.router, prefix="/profile", tags=["Account Profile"])
account_router.include_router(addresses.router, prefix="/addresses", tags=["Account Addresses"])
account_router.include_router(orders.router, prefix="/orders", tags=["Account Orders"])
account_router.include_router(wallet.router, prefix="/wallet", tags=["Account Wallet"])
account_router.include_router(returns.router, prefix="/returns", tags=["Account Returns"])
account_router.include_router(tickets.router, prefix="/tickets", tags=["Account Tickets"])
