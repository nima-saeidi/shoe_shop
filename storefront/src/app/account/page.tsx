'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { orderApi } from '@/lib/api/account'
import { formatDate, formatToman } from '@/lib/format'
import { ORDER_STATUS_FA } from '@/lib/labels'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import type { Order } from '@/types'

export default function AccountDashboard() {
  const user = useAuthStore((s) => s.user)
  const cartCount = useCartStore((s) => s.cart?.total_items ?? 0)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    orderApi.mine(1, 3).then((p) => {
      setOrders(p.items)
      setTotal(p.total)
    }).catch(() => setOrders([]))
  }, [])

  return (
    <>
      <h1 className="text-2xl font-bold">سلام{user ? `، ${user.full_name}` : ''} 👋</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-muted">موجودی کیف پول</p>
          <p className="mt-2 text-lg font-bold">{formatToman(user?.wallet_balance ?? 0)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted">تعداد سفارش‌ها</p>
          <p className="mt-2 text-lg font-bold">{total.toLocaleString('fa-IR')}</p>
        </div>
        <Link href="/cart" className="card p-5 transition hover:-translate-y-0.5">
          <p className="text-sm text-muted">سبد خرید</p>
          <p className="mt-2 text-lg font-bold">{cartCount.toLocaleString('fa-IR')} کالا</p>
        </Link>
      </div>

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
          <ul className="divide-y divide-blush-deep">
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
