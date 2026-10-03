'use client'

import Link from 'next/link'
import { useAuthStore } from '@/app/store/authStore'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useCart } from '@/features/cart/hooks/useCart'
import { useMyOrders } from '@/features/orders/hooks/useOrders'
import { formatDate, formatToman } from '@/utils/format'
import { ORDER_STATUS_FA } from '@/utils/labels'
import { ACCOUNT_ITEMS } from '../components/AccountNav'
import { ProfileCompletion } from '../components/ProfileCompletion'

const QUICK_ACTIONS = [
  { href: '/account/orders', label: 'مشاهده سفارش‌ها' },
  { href: '/account/tickets', label: 'ارسال تیکت' },
  { href: '/account/returns', label: 'درخواست مرجوعی' },
  { href: '/account/addresses', label: 'مدیریت آدرس‌ها' },
  { href: '/account/wallet', label: 'کیف پول' },
  { href: '/account/profile', label: 'ویرایش پروفایل' },
]

export function AccountDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const cartCount = useCart().data?.total_items ?? 0
  const { data: ordersPage, isError } = useMyOrders(1, 3)
  const orders = ordersPage?.items ?? (isError ? [] : null)

  return (
    <>
      <h1 className="text-2xl font-bold">سلام{user ? `، ${user.full_name}` : ''} 👋</h1>

      <ProfileCompletion hideWhenComplete />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-muted">موجودی کیف پول</p>
          <p className="mt-2 text-lg font-bold">{formatToman(user?.wallet_balance ?? 0)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted">تعداد سفارش‌ها</p>
          <p className="mt-2 text-lg font-bold">{(ordersPage?.total ?? 0).toLocaleString('fa-IR')}</p>
        </div>
        <Link href="/cart" className="card p-5 transition hover:border-brand/50">
          <p className="text-sm text-muted">سبد خرید</p>
          <p className="mt-2 text-lg font-bold">{cartCount.toLocaleString('fa-IR')} کالا</p>
        </Link>
      </div>

      <section aria-label="دسترسی سریع">
        <h2 className="mb-3 font-bold">دسترسی سریع</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {QUICK_ACTIONS.map((a) => (
            <li key={a.href}>
              <Link href={a.href} className="card flex h-full flex-col items-center gap-2 p-4 text-center text-sm transition hover:border-brand/50 hover:text-brand">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-lg bg-blush-deep text-lg text-brand">
                  {ACCOUNT_ITEMS.find((i) => i.href === a.href)?.icon}
                </span>
                {a.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">آخرین سفارش‌ها</h2>
          <Link href="/account/orders" className="text-sm text-brand-dark">همه سفارش‌ها</Link>
        </div>
        {orders === null ? (
          <p className="text-sm text-muted">در حال بارگذاری...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted">هنوز سفارشی ثبت نکرده‌اید. <Link href="/products" className="text-brand-dark">شروع خرید</Link></p>
        ) : (
          <ul className="divide-y divide-line">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span dir="ltr" className="font-medium">{o.order_number}</span>
                  <span className="text-muted">{formatDate(o.created_at)}</span>
                  <span>{formatToman(o.grand_total)}</span>
                  <StatusBadge value={o.status} labels={ORDER_STATUS_FA} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
