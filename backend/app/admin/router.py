from fastapi import APIRouter

from app.admin.routers import (
    auth,
    brands,
    categories,
    coupons,
    dashboard,
    logs,
    orders,
    products,
    reports,
    returns,
    reviews,
    settings as settings_router,
    tickets,
    users,
    wallet,
    wholesale,
)

admin_router = APIRouter(prefix="/admin")

admin_router.include_router(auth.router, tags=["Admin Auth"])
admin_router.include_router(dashboard.router, tags=["Admin Dashboard"])
admin_router.include_router(products.router, prefix="/products", tags=["Admin Products"])
admin_router.include_router(categories.router, prefix="/categories", tags=["Admin Categories"])
admin_router.include_router(brands.router, prefix="/brands", tags=["Admin Brands"])
admin_router.include_router(orders.router, prefix="/orders", tags=["Admin Orders"])
admin_router.include_router(users.router, prefix="/users", tags=["Admin Users"])
admin_router.include_router(coupons.router, prefix="/coupons", tags=["Admin Coupons"])
admin_router.include_router(reviews.router, prefix="/reviews", tags=["Admin Reviews"])
admin_router.include_router(wholesale.router, prefix="/wholesale", tags=["Admin Wholesale"])
admin_router.include_router(wallet.router, prefix="/wallet", tags=["Admin Wallet"])
admin_router.include_router(returns.router, prefix="/returns", tags=["Admin Returns"])
admin_router.include_router(tickets.router, prefix="/tickets", tags=["Admin Tickets"])
admin_router.include_router(reports.router, prefix="/reports", tags=["Admin Reports"])
admin_router.include_router(settings_router.router, prefix="/settings", tags=["Admin Settings"])
admin_router.include_router(logs.router, prefix="/logs", tags=["Admin Logs"])
