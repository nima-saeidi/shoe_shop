from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.address import AddressCreate, AddressOut, AddressUpdate
from app.schemas.common import Message
from app.services.address_service import AddressService

router = APIRouter()


@router.get("", response_model=list[AddressOut])
async def list_addresses(current_user: CurrentUser, db: DbSession):
    service = AddressService(db)
    return await service.list_addresses(current_user.id)


@router.post("", response_model=AddressOut, status_code=201)
async def create_address(data: AddressCreate, current_user: CurrentUser, db: DbSession):
    service = AddressService(db)
    return await service.create_address(current_user.id, data)


@router.put("/{address_id}", response_model=AddressOut)
async def update_address(address_id: int, data: AddressUpdate, current_user: CurrentUser, db: DbSession):
    service = AddressService(db)
    return await service.update_address(address_id, current_user.id, data)


@router.delete("/{address_id}", response_model=Message)
async def delete_address(address_id: int, current_user: CurrentUser, db: DbSession):
    service = AddressService(db)
    await service.delete_address(address_id, current_user.id)
    return Message(message="آدرس حذف شد")
