"""
Placeholder payment gateway integration.

TODO: wire this up to a real Iranian PSP (Zarinpal / IDPay / NextPay / ...)
once merchant credentials are available. The interface below is shaped the
way most of these gateways work (request a payment -> redirect user -> verify
callback) so swapping the stub for a real client later only touches this file.
"""
import logging
import uuid
from dataclasses import dataclass

from app.core.config import settings

logger = logging.getLogger("payment")


@dataclass
class PaymentRequestResult:
    success: bool
    redirect_url: str | None
    authority: str | None
    message: str = ""


@dataclass
class PaymentVerifyResult:
    success: bool
    ref_id: str | None
    message: str = ""


class PaymentService:
    def __init__(self):
        self.provider = settings.PAYMENT_PROVIDER
        self.merchant_id = settings.PAYMENT_MERCHANT_ID
        self.callback_url = settings.PAYMENT_CALLBACK_URL

    @property
    def is_configured(self) -> bool:
        return bool(self.provider and self.merchant_id)

    async def request_payment(self, amount: float, order_number: str, description: str = "") -> PaymentRequestResult:
        if not self.is_configured:
            logger.info(
                "[PAYMENT-STUB] no gateway configured — order %s for %.0f marked as awaiting manual payment",
                order_number,
                amount,
            )
            return PaymentRequestResult(success=False, redirect_url=None, authority=None, message="درگاه پرداخت هنوز تنظیم نشده است")

        # TODO: implement real provider call, e.g. for Zarinpal:
        # authority = await self._zarinpal_request(amount, description)
        # return PaymentRequestResult(True, f"https://www.zarinpal.com/pg/StartPay/{authority}", authority)
        authority = uuid.uuid4().hex
        logger.info("[PAYMENT] requested amount=%.0f order=%s via=%s", amount, order_number, self.provider)
        return PaymentRequestResult(success=True, redirect_url=self.callback_url, authority=authority)

    async def verify_payment(self, authority: str, amount: float) -> PaymentVerifyResult:
        if not self.is_configured:
            return PaymentVerifyResult(success=False, ref_id=None, message="درگاه پرداخت هنوز تنظیم نشده است")

        # TODO: implement real provider verification call.
        logger.info("[PAYMENT] verify authority=%s amount=%.0f via=%s", authority, amount, self.provider)
        return PaymentVerifyResult(success=True, ref_id=uuid.uuid4().hex[:12].upper())


payment_service = PaymentService()
