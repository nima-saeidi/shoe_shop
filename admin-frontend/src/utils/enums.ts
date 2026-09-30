// Persian labels for backend enums — mirrors app/admin/translations.py so the
// React admin panel and the legacy Jinja2 admin panel stay terminologically consistent.

export const ORDER_STATUS_FA: Record<string, string> = {
  pending: 'در انتظار بررسی',
  confirmed: 'تایید شده',
  processing: 'در حال آماده‌سازی',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
  returned: 'مرجوع شده',
}

export const PAYMENT_STATUS_FA: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  failed: 'ناموفق',
  refunded: 'بازگشت وجه',
}

export const ORDER_TYPE_FA: Record<string, string> = {
  retail: 'خرد',
  wholesale: 'عمده',
}

export const GENDER_FA: Record<string, string> = {
  unisex: 'یونیسکس',
  men: 'مردانه',
  women: 'زنانه',
  kids: 'بچگانه',
}

export const ROLE_FA: Record<string, string> = {
  customer: 'مشتری خرد',
  wholesale: 'مشتری عمده',
  admin: 'ادمین',
  superadmin: 'مدیر ارشد',
}

export const DISCOUNT_TYPE_FA: Record<string, string> = {
  percent: 'درصدی',
  fixed: 'مبلغ ثابت',
}

export const RETURN_STATUS_FA: Record<string, string> = {
  pending: 'در انتظار بررسی',
  approved: 'تایید شده',
  rejected: 'رد شده',
  completed: 'تکمیل شده',
}

export const RETURN_REASON_FA: Record<string, string> = {
  wrong_size: 'سایز نامناسب',
  defective: 'معیوب / آسیب‌دیده',
  not_as_described: 'عدم تطابق با توضیحات',
  changed_mind: 'انصراف از خرید',
  other: 'سایر موارد',
}

export const TICKET_STATUS_FA: Record<string, string> = {
  open: 'باز',
  answered: 'پاسخ داده شده',
  closed: 'بسته شده',
}

export const WHOLESALE_STATUS_FA: Record<string, string> = {
  none: 'بدون درخواست',
  pending: 'در انتظار بررسی',
  approved: 'تایید شده',
  rejected: 'رد شده',
}

export const WALLET_TX_TYPE_FA: Record<string, string> = {
  topup: 'شارژ حساب',
  deduct: 'کسر از حساب',
  refund: 'بازگشت وجه',
  order_payment: 'پرداخت سفارش',
}

export const LOG_LEVEL_FA: Record<string, string> = {
  info: 'اطلاعات',
  warning: 'هشدار',
  error: 'خطا',
}

export const LOG_CATEGORY_FA: Record<string, string> = {
  auth: 'احراز هویت',
  security: 'امنیت',
  order: 'سفارش',
  product: 'محصول',
  category: 'دسته‌بندی',
  brand: 'برند',
  coupon: 'کد تخفیف',
  wallet: 'کیف پول',
  wholesale: 'همکاری عمده',
  return: 'مرجوعی',
  ticket: 'تیکت پشتیبانی',
  review: 'نظر',
  user: 'کاربر',
}

export function translate(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return '-'
  return map[value] ?? value
}
