from fastapi import APIRouter

from app.api.v1.endpoints import (
    addresses,
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
