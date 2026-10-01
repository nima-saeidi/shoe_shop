from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.log import LogLevel
from app.models.user import UserRole
from app.schemas.order import OrderOut


class DashboardStatsOut(BaseModel):
    total_orders: int
    total_users: int
    total_products: int
    total_revenue: float
    pending_orders: int
    pending_wholesale: int
    low_stock_count: int
    status_counts: dict[str, int]
    recent_orders: list[OrderOut]


class SalesDayOut(BaseModel):
    day: str
    revenue: float
    orders: int


class TopProductOut(BaseModel):
    name: str
    qty: int


class TopSizeOut(BaseModel):
    size: str
    qty: int


class RevenueSplitOut(BaseModel):
    retail: float
    wholesale: float


class LowStockVariantOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    size: str
    color: str
    stock_quantity: int


class ReportsOut(BaseModel):
    sales: list[SalesDayOut]
    top_products: list[TopProductOut]
    top_sizes: list[TopSizeOut]
    revenue_split: RevenueSplitOut
    low_stock: list[LowStockVariantOut]


class LogEntryOut(BaseModel):
    id: int
    level: LogLevel
    category: str
    action: str
    message: str
    actor_id: Optional[int] = None
    actor_name: Optional[str] = None
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    ip_address: Optional[str] = None
    created_at: datetime


class SettingsStatusOut(BaseModel):
    sms_configured: bool
    sms_provider: Optional[str] = None
    payment_configured: bool
    payment_provider: Optional[str] = None


class AdminUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone_number: Optional[str] = None
    role: UserRole
    is_active: bool
    company_name: Optional[str] = None
    wallet_balance: float
    created_at: datetime


class AdminUserUpdate(BaseModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class WalletUserSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone_number: Optional[str] = None
    wallet_balance: float
