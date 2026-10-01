from fastapi import APIRouter, File, Form, Request, UploadFile
from fastapi.responses import RedirectResponse

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import flash, templates
from app.core.exceptions import AppException
from app.schemas.product import ProductCreate, ProductUpdate, ProductVariantCreate
from app.services.brand_service import BrandService
from app.services.category_service import CategoryService
from app.services.product_service import ProductService

router = APIRouter()


@router.get("")
async def list_products(request: Request, db: DbSession, current_admin: CurrentAdminUser, page: int = 1, q: str | None = None):
    service = ProductService(db)
    items, total = await service.search_products(
        offset=(page - 1) * 20, limit=20, q=q, is_active=None, order_by="created_at_desc"
    )
    pages = max((total + 19) // 20, 1)
    return templates.TemplateResponse(
        "products/list.html",
        {
            "request": request,
            "current_admin": current_admin,
            "products": items,
            "total": total,
            "page": page,
            "pages": pages,
            "q": q or "",
            "active_page": "products",
        },
    )


@router.get("/new")
async def new_product_form(request: Request, db: DbSession, current_admin: CurrentAdminUser):
    categories, _ = await CategoryService(db).list_categories(limit=200)
    brands, _ = await BrandService(db).list_brands(limit=200)
    return templates.TemplateResponse(
        "products/form.html",
        {
            "request": request,
            "current_admin": current_admin,
            "product": None,
            "categories": categories,
            "brands": brands,
            "active_page": "products",
        },
    )


@router.post("/new")
async def create_product(
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    name: str = Form(...),
    description: str = Form(""),
    price: float = Form(...),
    discount_price: str = Form(""),
    wholesale_price: str = Form(""),
    wholesale_min_qty: int = Form(1),
    sku: str = Form(...),
    gender: str = Form("unisex"),
    category_id: int = Form(...),
    brand_id: int = Form(...),
    is_active: bool = Form(False),
    is_featured: bool = Form(False),
    sizes: str = Form(""),
    colors: str = Form(""),
    stock_quantity: int = Form(0),
    files: list[UploadFile] = File(default=[]),
):
    service = ProductService(db)
    variants = []
    size_list = [s.strip() for s in sizes.split(",") if s.strip()]
    color_list = [c.strip() for c in colors.split(",") if c.strip()] or ["Default"]
    for size in size_list or ["One Size"]:
        for color in color_list:
            variants.append(ProductVariantCreate(size=size, color=color, stock_quantity=stock_quantity))

    try:
        product = await service.create_product(
            ProductCreate(
                name=name,
                description=description or None,
                price=price,
                discount_price=float(discount_price) if discount_price else None,
                wholesale_price=float(wholesale_price) if wholesale_price else None,
                wholesale_min_qty=wholesale_min_qty,
                sku=sku,
                gender=gender,
                category_id=category_id,
                brand_id=brand_id,
                is_active=is_active,
                is_featured=is_featured,
                variants=variants,
            ),
            actor_id=current_admin.id,
        )
        real_files = [f for f in files if f.filename]
        if real_files:
            await service.add_images(product.id, real_files)
        flash(request, "محصول با موفقیت ایجاد شد")
        return RedirectResponse(url=f"/admin/products/{product.id}/edit", status_code=302)
    except AppException as exc:
        flash(request, exc.detail, "danger")
        return RedirectResponse(url="/admin/products/new", status_code=302)


@router.get("/{product_id}/edit")
async def edit_product_form(product_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    product = await ProductService(db).get_product(product_id)
    categories, _ = await CategoryService(db).list_categories(limit=200)
    brands, _ = await BrandService(db).list_brands(limit=200)
    return templates.TemplateResponse(
        "products/form.html",
        {
            "request": request,
            "current_admin": current_admin,
            "product": product,
            "categories": categories,
            "brands": brands,
            "active_page": "products",
        },
    )


@router.post("/{product_id}/edit")
async def update_product(
    product_id: int,
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    name: str = Form(...),
    description: str = Form(""),
    price: float = Form(...),
    discount_price: str = Form(""),
    wholesale_price: str = Form(""),
    wholesale_min_qty: int = Form(1),
    gender: str = Form("unisex"),
    category_id: int = Form(...),
    brand_id: int = Form(...),
    is_active: bool = Form(False),
    is_featured: bool = Form(False),
):
    service = ProductService(db)
    try:
        await service.update_product(
            product_id,
            ProductUpdate(
                name=name,
                description=description or None,
                price=price,
                discount_price=float(discount_price) if discount_price else None,
                wholesale_price=float(wholesale_price) if wholesale_price else None,
                wholesale_min_qty=wholesale_min_qty,
                gender=gender,
                category_id=category_id,
                brand_id=brand_id,
                is_active=is_active,
                is_featured=is_featured,
            ),
            actor_id=current_admin.id,
        )
        flash(request, "محصول با موفقیت به‌روزرسانی شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/admin/products/{product_id}/edit", status_code=302)


@router.post("/{product_id}/delete")
async def delete_product(product_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = ProductService(db)
    try:
        await service.delete_product(product_id, actor_id=current_admin.id)
        flash(request, "محصول حذف شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/admin/products", status_code=302)


@router.post("/{product_id}/images")
async def upload_images(
    product_id: int,
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    files: list[UploadFile] = File(...),
    color: str = Form(""),
):
    """Accepts one or several photos at once for this shoe (optionally tagged to one design/color)."""
    service = ProductService(db)
    try:
        uploaded = await service.add_images(product_id, files, color or None)
        flash(request, f"{len(uploaded)} تصویر با موفقیت آپلود شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/admin/products/{product_id}/edit", status_code=302)


@router.post("/images/{image_id}/primary")
async def set_primary_image(image_id: int, product_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = ProductService(db)
    try:
        await service.set_primary_image(product_id, image_id)
        flash(request, "تصویر اصلی تغییر کرد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/admin/products/{product_id}/edit", status_code=302)


@router.post("/images/{image_id}/delete")
async def delete_image(image_id: int, product_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = ProductService(db)
    try:
        await service.delete_image(image_id)
        flash(request, "تصویر حذف شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/admin/products/{product_id}/edit", status_code=302)


@router.post("/{product_id}/variants")
async def add_variant(
    product_id: int,
    request: Request,
    db: DbSession,
    current_admin: CurrentAdminUser,
    size: str = Form(...),
    color: str = Form(...),
    stock_quantity: int = Form(0),
    extra_price: float = Form(0),
):
    service = ProductService(db)
    try:
        await service.add_variant(
            product_id, ProductVariantCreate(size=size, color=color, stock_quantity=stock_quantity, extra_price=extra_price)
        )
        flash(request, "ورینت (سایز/رنگ) اضافه شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/admin/products/{product_id}/edit", status_code=302)


@router.post("/variants/{variant_id}/delete")
async def delete_variant(variant_id: int, product_id: int, request: Request, db: DbSession, current_admin: CurrentAdminUser):
    service = ProductService(db)
    try:
        await service.delete_variant(variant_id)
        flash(request, "ورینت حذف شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url=f"/admin/products/{product_id}/edit", status_code=302)
