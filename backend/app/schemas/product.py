from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.brand import BrandOut
from app.schemas.category import CategoryOut


class ProductVariantBase(BaseModel):
    size: str = Field(max_length=10)
    color: str = Field(max_length=40)
    stock_quantity: int = Field(ge=0, default=0)
    extra_price: float = Field(ge=0, default=0)


class ProductVariantCreate(ProductVariantBase):
    pass


class ProductVariantUpdate(BaseModel):
    stock_quantity: Optional[int] = None
    extra_price: Optional[float] = None


class ProductVariantOut(ProductVariantBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ProductImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    alt_text: Optional[str] = None
    color: Optional[str] = None
    sort_order: int
    is_primary: bool


class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: Optional[str] = None
    price: float = Field(gt=0)
    discount_price: Optional[float] = Field(default=None, ge=0)
    wholesale_price: Optional[float] = Field(default=None, ge=0)
    wholesale_min_qty: int = Field(default=1, ge=1)
    sku: str = Field(min_length=2, max_length=64)
    gender: str = Field(default="unisex")
    category_id: int
    brand_id: int
    is_active: bool = True
    is_featured: bool = False


class ProductCreate(ProductBase):
    variants: List[ProductVariantCreate] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    discount_price: Optional[float] = None
    wholesale_price: Optional[float] = None
    wholesale_min_qty: Optional[int] = None
    gender: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class ProductListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    price: float
    discount_price: Optional[float] = None
    sku: str
    is_active: bool
    is_featured: bool


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime
    category: CategoryOut
    brand: BrandOut
    images: List[ProductImageOut] = []
    variants: List[ProductVariantOut] = []
