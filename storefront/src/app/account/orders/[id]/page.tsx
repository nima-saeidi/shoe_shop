'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { authApi, orderApi } from '@/lib/api/account'
import { formatDateTime, formatToman, getApiError } from '@/lib/format'
import { ORDER_STATUS_FA, PAYMENT_METHOD_FA, PAYMENT_STATUS_FA } from '@/lib/labels'
import { useAuthStore } from '@/store/auth'
import type { Order } from '@/types'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const placed = useSearchParams().get('placed') === '1'
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    orderApi.get(Number(id)).then(setOrder).catch((e) => setError(getApiError(e, 'سفارش پیدا نشد.')))
  }, [id])

  async function act(fn: () => Promise<Order>) {
    setBusy(true)
    setError(null)
    try {
      setOrder(await fn())
      authApi.me().then((u) => useAuthStore.getState().setUser(u)).catch(() => undefined)
    } catch (e) {
      setError(getApiError(e))
    } finally {
      setBusy(false)
    }
  }

  if (!order) return error ? <Alert>{error}</Alert> : <Spinner />

  const canCancel = order.status === 'pending' || order.status === 'confirmed'
  const canReturn = order.status === 'delivered'
  const canPay = order.payment_status === 'pending' && order.status !== 'cancelled'

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">سفارش <span dir="ltr">{order.order_number}</span></h1>
        <Link href="/account/orders" className="text-sm text-brand-dark">‹ همه سفارش‌ها</Link>
      </div>

      {placed && <Alert kind="success">سفارش شما با موفقیت ثبت شد. ممنون از خرید شما!</Alert>}
      {error && <Alert>{error}</Alert>}

      <section className="card space-y-3 p-5 text-sm">
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={order.status} labels={ORDER_STATUS_FA} />
          <StatusBadge value={order.payment_status} labels={PAYMENT_STATUS_FA} />
        </div>
        <p className="text-muted">ثبت‌شده در {formatDateTime(order.created_at)} · {PAYMENT_METHOD_FA[order.payment_method] ?? order.payment_method}</p>
        {order.tracking_code && (
          <p>کد رهگیری ({order.shipping_provider ?? 'پست'}): <span dir="ltr" className="font-medium">{order.tracking_code}</span></p>
        )}
        <p>
          <span className="text-muted">تحویل به: </span>
          {order.shipping_full_name} — {order.shipping_phone}
          <br />
          {order.shipping_city}، {order.shipping_address} (کد پستی {order.shipping_postal_code})
        </p>
      </section>

      <section className="card overflow-x-auto p-5">
        <table className="w-full min-w-[28rem] text-sm">
          <thead className="text-muted">
            <tr className="text-start">
              <th className="pb-2 text-start font-medium">کالا</th>
              <th className="pb-2 text-start font-medium">قیمت واحد</th>
              <th className="pb-2 text-start font-medium">تعداد</th>
              <th className="pb-2 text-start font-medium">جمع</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-deep">
            {order.items.map((i) => (
              <tr key={i.id}>
                <td className="py-3">{i.product_name}<span className="block text-xs text-muted">سایز {i.size} · {i.color}</span></td>
                <td>{formatToman(i.unit_price)}</td>
                <td>{i.quantity.toLocaleString('fa-IR')}</td>
                <td>{formatToman(i.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="mt-4 ms-auto max-w-xs space-y-1.5 border-t border-blush-deep pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">جمع کالاها</dt><dd>{formatToman(order.subtotal)}</dd></div>
          {order.discount_total > 0 && <div className="flex justify-between"><dt className="text-muted">تخفیف</dt><dd>−{formatToman(order.discount_total)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">هزینه ارسال</dt><dd>{formatToman(order.shipping_cost)}</dd></div>
          <div className="flex justify-between text-base font-bold"><dt>مبلغ نهایی</dt><dd>{formatToman(order.grand_total)}</dd></div>
        </dl>
      </section>

      {canReturn && (
        <Link href={`/account/returns?order=${order.id}`} className="btn btn-outline w-fit">
          ثبت درخواست مرجوعی
        </Link>
      )}

      {(canPay || canCancel) && (
        <div className="flex flex-wrap gap-3">
          {canPay && (
            <button type="button" disabled={busy} onClick={() => act(() => orderApi.payFromWallet(order.id))} className="btn btn-primary">
              پرداخت از کیف پول
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              disabled={busy}
              onClick={() => window.confirm('این سفارش لغو شود؟') && act(() => orderApi.cancel(order.id))}
              className="btn btn-outline"
            >
              لغو سفارش
            </button>
          )}
        </div>
      )}
    </>
  )
}
