'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { orderApi } from '@/lib/api/account'
import { formatDate, formatToman, getApiError } from '@/lib/format'
import { ORDER_STATUS_FA, PAYMENT_STATUS_FA } from '@/lib/labels'
import type { Order, Page } from '@/types'

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Page<Order> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setData(null)
    orderApi.mine(page, 10).then(setData).catch((e) => setError(getApiError(e)))
  }, [page])

  return (
    <>
      <h1 className="text-2xl font-bold">سفارش‌های من</h1>
      {error && <Alert>{error}</Alert>}
      {!data && !error && <Spinner />}
      {data && data.items.length === 0 && (
        <div className="card p-10 text-center text-muted">
          سفارشی ثبت نشده است. <Link href="/products" className="text-brand-dark">مشاهده محصولات</Link>
        </div>
      )}
      {data && data.items.length > 0 && (
        <>
          <ul className="space-y-3">
            {data.items.map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.id}`} className="card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:-translate-y-0.5">
                  <div>
                    <p className="font-semibold" dir="ltr">{o.order_number}</p>
                    <p className="text-xs text-muted">{formatDate(o.created_at)} · {o.items.length.toLocaleString('fa-IR')} قلم</p>
                  </div>
                  <p className="font-medium">{formatToman(o.grand_total)}</p>
                  <div className="flex gap-2">
                    <StatusBadge value={o.status} labels={ORDER_STATUS_FA} />
                    <StatusBadge value={o.payment_status} labels={PAYMENT_STATUS_FA} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button type="button" className="btn btn-soft" disabled={page <= 1} onClick={() => setPage(page - 1)}>قبلی</button>
              <span className="text-sm text-muted">{page.toLocaleString('fa-IR')} / {data.pages.toLocaleString('fa-IR')}</span>
              <button type="button" className="btn btn-soft" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>بعدی</button>
            </div>
          )}
        </>
      )}
    </>
  )
}
