from typing import List, Optional

from pydantic import BaseModel, Field


class ManualOrderItemInput(BaseModel):
    variant_id: int
    quantity: int = Field(gt=0)


class ManualOrderCreate(BaseModel):
    user_id: int
    items: List[ManualOrderItemInput]
    shipping_full_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_postal_code: str
    payment_method: str = "bank_transfer"
    notes: Optional[str] = None
