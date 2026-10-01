from pydantic import BaseModel, ConfigDict, Field


class AddressBase(BaseModel):
    full_name: str = Field(max_length=150)
    phone_number: str = Field(max_length=20)
    city: str = Field(max_length=100)
    address_line: str = Field(max_length=500)
    postal_code: str = Field(max_length=20)
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    full_name: str | None = None
    phone_number: str | None = None
    city: str | None = None
    address_line: str | None = None
    postal_code: str | None = None
    is_default: bool | None = None


class AddressOut(AddressBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
