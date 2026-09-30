from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.wallet import WalletTxType


class WalletTopupRequest(BaseModel):
    amount: float = Field(gt=0)
    description: Optional[str] = None


class WalletTransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tx_type: WalletTxType
    amount: float
    balance_after: float
    description: Optional[str] = None
    created_at: datetime


class WalletBalanceOut(BaseModel):
    balance: float


class WalletDetailOut(BaseModel):
    user_id: int
    full_name: str
    balance: float
    transactions: list[WalletTransactionOut]
