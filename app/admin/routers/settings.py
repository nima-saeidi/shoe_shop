from fastapi import APIRouter, Request

from app.admin.deps import CurrentAdminUser
from app.admin.templating import templates
from app.core.config import settings

router = APIRouter()


@router.get("")
async def settings_page(request: Request, current_admin: CurrentAdminUser):
    return templates.TemplateResponse(
        "settings/index.html",
        {
            "request": request,
            "current_admin": current_admin,
            "sms_configured": bool(settings.SMS_PROVIDER and settings.SMS_API_KEY),
            "payment_configured": bool(settings.PAYMENT_PROVIDER and settings.PAYMENT_MERCHANT_ID),
            "sms_provider": settings.SMS_PROVIDER,
            "payment_provider": settings.PAYMENT_PROVIDER,
            "active_page": "settings",
        },
    )
