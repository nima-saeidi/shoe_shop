from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.support import TicketStatus


class TicketCreate(BaseModel):
    subject: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=1, max_length=2000)


class TicketMessageCreate(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class TicketMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    sender_name: Optional[str] = None
    is_admin: bool
    message: str
    created_at: datetime


class TicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    subject: str
    status: TicketStatus
    created_at: datetime
    updated_at: datetime
    customer_name: Optional[str] = None
    messages: List[TicketMessageOut] = []
