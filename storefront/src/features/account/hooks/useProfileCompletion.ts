import type { User } from '@/types'

export interface CompletionItem {
  key: string
  label: string
  done: boolean
  href: string
}

export const isMobile = (v: string | null | undefined) => /^09\d{9}$/.test((v ?? '').trim())

/** Profile completeness: drives the "complete your profile" prompts on the dashboard and profile page. */
export function getCompletion(user: User | null, addressCount: number | null) {
  const items: CompletionItem[] = [
    { key: 'email', label: 'ایمیل ثبت شده', done: Boolean(user?.email), href: '/account/profile' },
    { key: 'name', label: 'نام و نام خانوادگی کامل', done: (user?.full_name ?? '').trim().split(/\s+/).length >= 2, href: '/account/profile' },
    { key: 'phone', label: 'شماره موبایل', done: isMobile(user?.phone_number), href: '/account/profile' },
    { key: 'address', label: 'حداقل یک آدرس تحویل', done: (addressCount ?? 0) > 0, href: '/account/addresses' },
  ]
  const done = items.filter((i) => i.done).length
  return { items, percent: Math.round((done / items.length) * 100), complete: done === items.length }
}
