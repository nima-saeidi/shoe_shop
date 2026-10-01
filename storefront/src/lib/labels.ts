export const ORDER_STATUS_FA: Record<string, string> = {
  pending: 'در انتظار بررسی',
  confirmed: 'تأیید شده',
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

export const PAYMENT_METHOD_FA: Record<string, string> = {
  cod: 'پرداخت در محل',
  wallet: 'کیف پول',
}

export const TX_TYPE_FA: Record<string, string> = {
  topup: 'شارژ کیف پول',
  deduct: 'کسر از کیف پول',
  refund: 'بازگشت وجه',
  order_payment: 'پرداخت سفارش',
}

export const STATUS_TONE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-sky-100 text-sky-800',
  processing: 'bg-sky-100 text-sky-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  paid: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
  returned: 'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-700',
  open: 'bg-amber-100 text-amber-800',
  answered: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-slate-100 text-slate-700',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-sky-100 text-sky-800',
}

export const TICKET_STATUS_FA: Record<string, string> = {
  open: 'در انتظار پاسخ',
  answered: 'پاسخ داده شده',
  closed: 'بسته شده',
}

export const RETURN_STATUS_FA: Record<string, string> = {
  pending: 'در انتظار بررسی',
  approved: 'تأیید شده',
  rejected: 'رد شده',
  completed: 'تکمیل شده',
}

export const RETURN_REASON_FA: Record<string, string> = {
  wrong_size: 'سایز نامناسب',
  defective: 'کالا معیوب است',
  not_as_described: 'با توضیحات مطابقت ندارد',
  changed_mind: 'تغییر نظر',
  other: 'سایر',
}
