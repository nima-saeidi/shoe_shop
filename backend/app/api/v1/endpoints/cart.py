from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartOut
from app.schemas.common import Message
from app.services.cart_service import CartService

router = APIRouter()


@router.get("", response_model=CartOut)
async def get_cart(current_user: CurrentUser, db: DbSession):
    service = CartService(db)
    return await service.get_cart(current_user.id)


@router.post("/items", response_model=CartOut, status_code=201)
async def add_item(data: CartItemCreate, current_user: CurrentUser, db: DbSession):
    service = CartService(db)
    return await service.add_item(current_user.id, data)


@router.put("/items/{item_id}", response_model=CartOut)
async def update_item(item_id: int, data: CartItemUpdate, current_user: CurrentUser, db: DbSession):
    service = CartService(db)
    return await service.update_item(current_user.id, item_id, data)


@router.delete("/items/{item_id}", response_model=CartOut)
async def remove_item(item_id: int, current_user: CurrentUser, db: DbSession):
    service = CartService(db)
    return await service.remove_item(current_user.id, item_id)


@router.delete("", response_model=Message)
async def clear_cart(current_user: CurrentUser, db: DbSession):
    service = CartService(db)
    await service.clear_cart(current_user.id)
    return Message(message="سبد خرید خالی شد")
