from fastapi import APIRouter

from app.api.v1.endpoints import (
    addresses,
    admin_dashboard,
    admin_logs,
    admin_notifications,
    admin_orders,
    admin_products,
    admin_reports,
    admin_reviews,
    admin_settings,
    admin_tickets,
    admin_users,
    auth,
    brands,
    cart,
    categories,
    coupons,
    orders,
    products,
    returns,
    reviews,
    tickets,
    users,
    wallet,
    wholesale,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(brands.router, prefix="/brands", tags=["Brands"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(cart.router, prefix="/cart", tags=["Cart"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(reviews.router, prefix="/products", tags=["Reviews"])
api_router.include_router(coupons.router, prefix="/coupons", tags=["Coupons"])
api_router.include_router(addresses.router, prefix="/addresses", tags=["Addresses"])
api_router.include_router(wholesale.router, prefix="/wholesale", tags=["Wholesale"])
api_router.include_router(wallet.router, prefix="/wallet", tags=["Wallet"])
api_router.include_router(returns.router, prefix="/returns", tags=["Returns"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["Support Tickets"])

# Admin-only JSON endpoints, consumed by the React admin panel. Hidden from the
# public Swagger schema (see each router's include_in_schema=False) since they're
# not part of the customer/site-facing API surface.
api_router.include_router(admin_dashboard.router, prefix="/admin/dashboard", tags=["Admin"])
api_router.include_router(admin_reports.router, prefix="/admin/reports", tags=["Admin"])
api_router.include_router(admin_logs.router, prefix="/admin/logs", tags=["Admin"])
api_router.include_router(admin_settings.router, prefix="/admin/settings", tags=["Admin"])
api_router.include_router(admin_users.router, prefix="/admin/users", tags=["Admin"])
api_router.include_router(admin_products.router, prefix="/admin/products", tags=["Admin"])
api_router.include_router(admin_orders.router, prefix="/admin/orders", tags=["Admin"])
api_router.include_router(admin_reviews.router, prefix="/admin/reviews", tags=["Admin"])
api_router.include_router(admin_tickets.router, prefix="/admin/tickets", tags=["Admin"])
api_router.include_router(admin_notifications.router, prefix="/admin/notifications", tags=["Admin"])
