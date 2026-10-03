'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDateTime, formatToman, getApiError } from '@/utils/format'
import { ORDER_STATUS_FA, PAYMENT_METHOD_FA, PAYMENT_STATUS_FA } from '@/utils/labels'
import { OrderItemsTable } from '../components/OrderItemsTable'
import { useCancelOrder, useOrder, usePayOrderFromWallet } from '../hooks/useOrders'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const orderId = Number(id)
  const placed = useSearchParams().get('placed') === '1'
  const { data: order, error: loadError } = useOrder(orderId)
  const cancel = useCancelOrder(orderId)
  const pay = usePayOrderFromWallet(orderId)

  if (!order) return loadError ? <Alert>{getApiError(loadError, 'سفارش پیدا نشد.')}</Alert> : <Spinner />

  const busy = cancel.isPending || pay.isPending
  const actionError = cancel.error ?? pay.error
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
      {actionError && <Alert>{getApiError(actionError)}</Alert>}

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

      <OrderItemsTable order={order} />

      {canReturn && (
        <Link href={`/account/returns?order=${order.id}`} className="btn btn-outline w-fit">
          ثبت درخواست مرجوعی
        </Link>
      )}

      {(canPay || canCancel) && (
        <div className="flex flex-wrap gap-3">
          {canPay && (
            <button type="button" disabled={busy} onClick={() => pay.mutate()} className="btn btn-primary">
              پرداخت از کیف پول
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              disabled={busy}
              onClick={() => window.confirm('این سفارش لغو شود؟') && cancel.mutate()}
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
