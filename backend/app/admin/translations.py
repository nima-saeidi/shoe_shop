ORDER_STATUS_FA = {
    "pending": "در انتظار بررسی",
    "confirmed": "تایید شده",
    "processing": "در حال آماده‌سازی",
    "shipped": "ارسال شده",
    "delivered": "تحویل داده شده",
    "cancelled": "لغو شده",
    "returned": "مرجوع شده",
}

PAYMENT_STATUS_FA = {
    "pending": "در انتظار پرداخت",
    "paid": "پرداخت شده",
    "failed": "ناموفق",
    "refunded": "بازگشت وجه",
}

GENDER_FA = {
    "men": "مردانه",
    "women": "زنانه",
    "kids": "بچگانه",
    "unisex": "یونیسکس",
}

ROLE_FA = {
    "customer": "مشتری خرد",
    "wholesale": "مشتری عمده",
    "admin": "ادمین",
    "superadmin": "مدیر ارشد",
}

DISCOUNT_TYPE_FA = {
    "percent": "درصدی",
    "fixed": "مبلغ ثابت",
}

ORDER_TYPE_FA = {
    "retail": "خرد",
    "wholesale": "عمده",
}

RETURN_REASON_FA = {
    "wrong_size": "سایز نامناسب",
    "defective": "معیوب / آسیب‌دیده",
    "not_as_described": "عدم تطابق با توضیحات",
    "changed_mind": "انصراف از خرید",
    "other": "سایر موارد",
}

RETURN_STATUS_FA = {
    "pending": "در انتظار بررسی",
    "approved": "تایید شده",
    "rejected": "رد شده",
    "completed": "تکمیل شده",
}

TICKET_STATUS_FA = {
    "open": "باز",
    "answered": "پاسخ داده شده",
    "closed": "بسته شده",
}

WHOLESALE_REQUEST_STATUS_FA = {
    "none": "بدون درخواست",
    "pending": "در انتظار بررسی",
    "approved": "تایید شده (عمده‌فروش)",
    "rejected": "رد شده",
}

WALLET_TX_TYPE_FA = {
    "topup": "شارژ حساب",
    "deduct": "کسر از حساب",
    "refund": "بازگشت وجه",
    "order_payment": "پرداخت سفارش",
}

LOG_LEVEL_FA = {
    "info": "اطلاعات",
    "warning": "هشدار",
    "error": "خطا",
}

LOG_CATEGORY_FA = {
    "auth": "احراز هویت",
    "security": "امنیت",
    "order": "سفارش",
    "product": "محصول",
    "category": "دسته‌بندی",
    "brand": "برند",
    "coupon": "کد تخفیف",
    "wallet": "کیف پول",
    "wholesale": "همکاری عمده",
    "return": "مرجوعی",
    "ticket": "تیکت پشتیبانی",
    "review": "نظر",
    "user": "کاربر",
}

_CATEGORIES = {
    "order_status": ORDER_STATUS_FA,
    "payment_status": PAYMENT_STATUS_FA,
    "gender": GENDER_FA,
    "role": ROLE_FA,
    "discount_type": DISCOUNT_TYPE_FA,
    "order_type": ORDER_TYPE_FA,
    "return_status": RETURN_STATUS_FA,
    "return_reason": RETURN_REASON_FA,
    "ticket_status": TICKET_STATUS_FA,
    "wholesale_status": WHOLESALE_REQUEST_STATUS_FA,
    "wallet_tx_type": WALLET_TX_TYPE_FA,
    "log_level": LOG_LEVEL_FA,
    "log_category": LOG_CATEGORY_FA,
}


def translate(category: str, value) -> str:
    if value is None:
        return "-"
    key = value.value if hasattr(value, "value") else str(value)
    return _CATEGORIES.get(category, {}).get(key, key)
