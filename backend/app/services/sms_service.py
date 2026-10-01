"""
Placeholder SMS gateway integration.

TODO: wire this up to a real provider (Kavenegar / IPPanel / Melipayamak / ...)
once credentials are available. For now it just logs the message so the rest
of the application (order confirmations, tracking codes, OTP-less notices,
wholesale approval, etc.) can call `send_sms(...)` without caring whether a
real provider is configured yet.
"""
import logging

from app.core.config import settings

logger = logging.getLogger("sms")


class SmsService:
    def __init__(self):
        self.provider = settings.SMS_PROVIDER
        self.api_key = settings.SMS_API_KEY
        self.sender = settings.SMS_SENDER_NUMBER

    @property
    def is_configured(self) -> bool:
        return bool(self.provider and self.api_key)

    async def send_sms(self, phone_number: str, message: str) -> bool:
        if not self.is_configured:
            logger.info("[SMS-STUB] to=%s message=%s (no provider configured)", phone_number, message)
            return False

        # TODO: implement real provider call, e.g.:
        # if self.provider == "kavenegar":
        #     async with httpx.AsyncClient() as client:
        #         await client.post(f"https://api.kavenegar.com/v1/{self.api_key}/sms/send.json", ...)
        logger.info("[SMS] to=%s message=%s via=%s", phone_number, message, self.provider)
        return True

    async def notify_order_status(self, phone_number: str, order_number: str, status_fa: str) -> None:
        await self.send_sms(phone_number, f"سفارش شما به شماره {order_number} به وضعیت «{status_fa}» تغییر کرد.")

    async def notify_wholesale_approval(self, phone_number: str, approved: bool) -> None:
        text = "درخواست همکاری عمده شما تایید شد." if approved else "درخواست همکاری عمده شما رد شد."
        await self.send_sms(phone_number, text)


sms_service = SmsService()
