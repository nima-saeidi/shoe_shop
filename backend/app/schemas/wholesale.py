from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.user import WholesaleStatus


class WholesaleUpgradeRequest(BaseModel):
    company_name: str = Field(min_length=2, max_length=200)


class WholesaleRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone_number: Optional[str] = None
    company_name: Optional[str] = None
    wholesale_status: WholesaleStatus
    wholesale_requested_at: Optional[datetime] = None


class WholesaleDecision(BaseModel):
    approve: bool
