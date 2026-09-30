from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.return_request import ReturnReason, ReturnStatus


class ReturnRequestCreate(BaseModel):
    order_item_id: int
    reason: ReturnReason
    description: Optional[str] = Field(default=None, max_length=500)


class ReturnRequestModerate(BaseModel):
    status: ReturnStatus
    admin_note: Optional[str] = Field(default=None, max_length=500)


class ReturnRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    order_item_id: int
    reason: ReturnReason
    description: Optional[str] = None
    status: ReturnStatus
    admin_note: Optional[str] = None
    created_at: datetime
