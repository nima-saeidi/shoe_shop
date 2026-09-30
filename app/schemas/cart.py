from pydantic import BaseModel, ConfigDict, Field


class CartItemCreate(BaseModel):
    variant_id: int
    quantity: int = Field(gt=0, default=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0)


class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    variant_id: int
    quantity: int
    product_name: str
    size: str
    color: str
    unit_price: float
    line_total: float
    image_url: str | None = None


class CartOut(BaseModel):
    id: int
    items: list[CartItemOut]
    subtotal: float
    total_items: int
