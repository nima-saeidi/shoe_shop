from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus, OrderType, PaymentStatus


class CheckoutRequest(BaseModel):
    shipping_full_name: str = Field(max_length=150)
    shipping_phone: str = Field(max_length=20)
    shipping_address: str = Field(max_length=500)
    shipping_city: str = Field(max_length=100)
    shipping_postal_code: str = Field(max_length=20)
    payment_method: str = Field(default="cod")
    coupon_code: Optional[str] = None
    notes: Optional[str] = None


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_name: str
    size: str
    color: str
    unit_price: float
    quantity: int
    line_total: float


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    user_id: int
    is_manual: bool
    order_type: OrderType
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: str
    subtotal: float
    discount_total: float
    shipping_cost: float
    grand_total: float
    shipping_full_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_postal_code: str
    shipping_provider: Optional[str] = None
    tracking_code: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut] = []


class OrderStatusUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    shipping_provider: Optional[str] = None
    tracking_code: Optional[str] = None
