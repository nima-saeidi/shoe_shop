from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=1000)


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    user_id: int
    product_name: Optional[str] = None
    customer_name: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    is_approved: bool
    created_at: datetime


class ReviewModerate(BaseModel):
    is_approved: bool
