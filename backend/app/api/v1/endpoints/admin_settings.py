from fastapi import APIRouter

from app.api.deps import CurrentAdmin
from app.core.config import settings
from app.schemas.admin import SettingsStatusOut

router = APIRouter()


@router.get("", response_model=SettingsStatusOut, include_in_schema=False)
async def get_settings_status(_: CurrentAdmin):
    return SettingsStatusOut(
        sms_configured=bool(settings.SMS_PROVIDER and settings.SMS_API_KEY),
        sms_provider=settings.SMS_PROVIDER or None,
        payment_configured=bool(settings.PAYMENT_PROVIDER and settings.PAYMENT_MERCHANT_ID),
        payment_provider=settings.PAYMENT_PROVIDER or None,
    )
