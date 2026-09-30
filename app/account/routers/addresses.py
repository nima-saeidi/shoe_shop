from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse

from app.account.deps import CurrentCustomer, DbSession
from app.account.templating import flash, templates
from app.core.exceptions import AppException
from app.schemas.address import AddressCreate, AddressUpdate
from app.services.address_service import AddressService

router = APIRouter()


@router.get("")
async def list_addresses(request: Request, db: DbSession, current_customer: CurrentCustomer):
    service = AddressService(db)
    addresses = await service.list_addresses(current_customer.id)
    return templates.TemplateResponse(
        "addresses/list.html",
        {"request": request, "current_customer": current_customer, "addresses": addresses, "active_page": "addresses"},
    )


@router.get("/new")
async def new_address_form(request: Request, current_customer: CurrentCustomer):
    return templates.TemplateResponse(
        "addresses/form.html",
        {"request": request, "current_customer": current_customer, "address": None, "active_page": "addresses"},
    )


@router.post("/new")
async def create_address(
    request: Request,
    db: DbSession,
    current_customer: CurrentCustomer,
    full_name: str = Form(...),
    phone_number: str = Form(...),
    city: str = Form(...),
    address_line: str = Form(...),
    postal_code: str = Form(...),
    is_default: bool = Form(False),
):
    service = AddressService(db)
    try:
        await service.create_address(
            current_customer.id,
            AddressCreate(
                full_name=full_name,
                phone_number=phone_number,
                city=city,
                address_line=address_line,
                postal_code=postal_code,
                is_default=is_default,
            ),
        )
        flash(request, "آدرس جدید با موفقیت ثبت شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/account/addresses", status_code=302)


@router.get("/{address_id}/edit")
async def edit_address_form(address_id: int, request: Request, db: DbSession, current_customer: CurrentCustomer):
    service = AddressService(db)
    addresses = await service.list_addresses(current_customer.id)
    address = next((a for a in addresses if a.id == address_id), None)
    if not address:
        flash(request, "آدرس یافت نشد", "danger")
        return RedirectResponse(url="/account/addresses", status_code=302)
    return templates.TemplateResponse(
        "addresses/form.html",
        {"request": request, "current_customer": current_customer, "address": address, "active_page": "addresses"},
    )


@router.post("/{address_id}/edit")
async def update_address(
    address_id: int,
    request: Request,
    db: DbSession,
    current_customer: CurrentCustomer,
    full_name: str = Form(...),
    phone_number: str = Form(...),
    city: str = Form(...),
    address_line: str = Form(...),
    postal_code: str = Form(...),
    is_default: bool = Form(False),
):
    service = AddressService(db)
    try:
        await service.update_address(
            address_id,
            current_customer.id,
            AddressUpdate(
                full_name=full_name,
                phone_number=phone_number,
                city=city,
                address_line=address_line,
                postal_code=postal_code,
                is_default=is_default,
            ),
        )
        flash(request, "آدرس با موفقیت به‌روزرسانی شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/account/addresses", status_code=302)


@router.post("/{address_id}/delete")
async def delete_address(address_id: int, request: Request, db: DbSession, current_customer: CurrentCustomer):
    service = AddressService(db)
    try:
        await service.delete_address(address_id, current_customer.id)
        flash(request, "آدرس حذف شد")
    except AppException as exc:
        flash(request, exc.detail, "danger")
    return RedirectResponse(url="/account/addresses", status_code=302)
