const nf = new Intl.NumberFormat('fa-IR')
const df = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric' })
const dtf = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatNumber = (n: number) => nf.format(n)
export const formatToman = (n: number) => `${nf.format(Math.round(n))} تومان`

// The API returns naive UTC timestamps; treat them as UTC so the Tehran offset is applied correctly.
function parse(value: string): Date {
  return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`)
}
export const formatDate = (v: string) => df.format(parse(v))
export const formatDateTime = (v: string) => dtf.format(parse(v))

export function getApiError(error: unknown, fallback = 'خطایی رخ داد. دوباره تلاش کنید.'): string {
  const e = error as { code?: string; response?: { status?: number; data?: { detail?: unknown } }; request?: unknown }
  const detail = e?.response?.data?.detail
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail) && detail[0]?.msg) return 'اطلاعات واردشده نامعتبر است.'
  if (e?.code === 'ECONNABORTED') return 'پاسخی از سرور دریافت نشد. دوباره تلاش کنید.'
  if (e && !e.response && e.request) return 'ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.'
  if (e?.response?.status && e.response.status >= 500) return 'خطای داخلی سرور. کمی بعد دوباره تلاش کنید.'
  return fallback
}
