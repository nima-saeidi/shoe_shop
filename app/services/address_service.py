from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.address import Address
from app.repositories.address_repo import AddressRepository
from app.schemas.address import AddressCreate, AddressUpdate


class AddressService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AddressRepository(db)

    async def list_addresses(self, user_id: int):
        return await self.repo.list_for_user(user_id)

    async def _get_owned(self, address_id: int, user_id: int) -> Address:
        address = await self.repo.get(address_id)
        if not address:
            raise NotFoundError("Address not found")
        if address.user_id != user_id:
            # Returning 404 rather than 403 avoids confirming to an attacker that an
            # address with this id exists but simply belongs to someone else.
            raise NotFoundError("Address not found")
        return address

    async def create_address(self, user_id: int, data: AddressCreate) -> Address:
        if data.is_default:
            for addr in await self.repo.list_for_user(user_id):
                addr.is_default = False
        address = await self.repo.create(user_id=user_id, **data.model_dump())
        await self.db.commit()
        await self.db.refresh(address)
        return address

    async def update_address(self, address_id: int, user_id: int, data: AddressUpdate) -> Address:
        address = await self._get_owned(address_id, user_id)
        payload = data.model_dump(exclude_unset=True)
        if payload.get("is_default"):
            for addr in await self.repo.list_for_user(user_id):
                addr.is_default = False
        await self.repo.update(address, **payload)
        await self.db.commit()
        await self.db.refresh(address)
        return address

    async def delete_address(self, address_id: int, user_id: int) -> None:
        address = await self._get_owned(address_id, user_id)
        await self.repo.delete(address)
        await self.db.commit()
