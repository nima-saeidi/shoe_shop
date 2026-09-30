from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.brand import Brand
    from app.models.category import Category
    from app.models.review import Review


class Product(TimestampMixin, Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(4000), nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    discount_price: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    wholesale_price: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    wholesale_min_qty: Mapped[int] = mapped_column(default=1)
    sku: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    gender: Mapped[str] = mapped_column(String(20), default="unisex")  # men/women/kids/unisex
    is_active: Mapped[bool] = mapped_column(default=True)
    is_featured: Mapped[bool] = mapped_column(default=False)

    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id"))

    category: Mapped["Category"] = relationship(back_populates="products")
    brand: Mapped["Brand"] = relationship(back_populates="products")
    images: Mapped[List["ProductImage"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.sort_order"
    )
    variants: Mapped[List["ProductVariant"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )
    reviews: Mapped[List["Review"]] = relationship(back_populates="product", cascade="all, delete-orphan")

    @property
    def total_stock(self) -> int:
        return sum(v.stock_quantity for v in self.variants)

    @property
    def final_price(self) -> float:
        return float(self.discount_price) if self.discount_price else float(self.price)

    def price_for(self, is_wholesale: bool, quantity: int = 1) -> float:
        if is_wholesale and self.wholesale_price and quantity >= self.wholesale_min_qty:
            return float(self.wholesale_price)
        return self.final_price


class ProductImage(TimestampMixin, Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    image_url: Mapped[str] = mapped_column(String(500))
    alt_text: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    color: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    sort_order: Mapped[int] = mapped_column(default=0)
    is_primary: Mapped[bool] = mapped_column(default=False)

    product: Mapped["Product"] = relationship(back_populates="images")


class ProductVariant(TimestampMixin, Base):
    __tablename__ = "product_variants"
    __table_args__ = (UniqueConstraint("product_id", "size", "color", name="uq_variant_product_size_color"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    size: Mapped[str] = mapped_column(String(10))
    color: Mapped[str] = mapped_column(String(40))
    stock_quantity: Mapped[int] = mapped_column(default=0)
    extra_price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)

    product: Mapped["Product"] = relationship(back_populates="variants")
