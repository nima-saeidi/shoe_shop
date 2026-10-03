'use client'

import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { useMyOrders } from '@/features/orders/hooks/useOrders'
import { formatDate, getApiError } from '@/utils/format'
import { RETURN_REASON_FA } from '@/utils/labels'
import { useCreateReturn } from '../hooks/useReturns'

interface Props {
  preselectOrderId: number | null
  onDone: () => void
  onCancel: () => void
}

/** Pick a delivered order, one of its items and a reason. */
export function ReturnRequestForm({ preselectOrderId, onDone, onCancel }: Props) {
  const { data: ordersPage } = useMyOrders(1, 50)
  const create = useCreateReturn()
  const [orderId, setOrderId] = useState<number | null>(preselectOrderId)
  const [validationError, setValidationError] = useState<string | null>(null)

  const orders = (ordersPage?.items ?? []).filter((o) => o.status === 'delivered')
  const order = orders.find((o) => o.id === orderId)
  const error = validationError ?? (create.error ? getApiError(create.error) : null)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const itemId = Number(f.get('item'))
    if (!itemId) return setValidationError('کالای موردنظر را انتخاب کنید.')
    setValidationError(null)
    create.mutate(
      { order_item_id: itemId, reason: String(f.get('reason')), description: String(f.get('description')).trim() || undefined },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <h2 className="font-bold">درخواست مرجوعی جدید</h2>
      {error && <Alert>{error}</Alert>}
      {orders.length === 0 ? (
        <Alert kind="info">فقط سفارش‌های «تحویل داده شده» قابل مرجوعی هستند و هنوز سفارشی با این وضعیت ندارید.</Alert>
      ) : (
        <>
          <div>
            <label htmlFor="order" className="mb-1.5 block text-sm font-medium">سفارش</label>
            <select id="order" className="input" value={orderId ?? ''} onChange={(e) => setOrderId(Number(e.target.value) || null)} required>
              <option value="">انتخاب کنید...</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>{o.order_number} — {formatDate(o.created_at)}</option>
              ))}
            </select>
          </div>
          {order && (
            <>
              <div>
                <label htmlFor="item" className="mb-1.5 block text-sm font-medium">کالا</label>
                <select id="item" name="item" className="input" required defaultValue="">
                  <option value="" disabled>انتخاب کنید...</option>
                  {order.items.map((i) => (
                    <option key={i.id} value={i.id}>{i.product_name} (سایز {i.size}، {i.color})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="reason" className="mb-1.5 block text-sm font-medium">دلیل مرجوعی</label>
                <select id="reason" name="reason" className="input" required>
                  {Object.entries(RETURN_REASON_FA).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium">توضیحات (اختیاری)</label>
                <textarea id="description" name="description" className="input" rows={3} maxLength={500} />
              </div>
            </>
          )}
        </>
      )}
      <div className="flex gap-3">
        {order && <button type="submit" disabled={create.isPending} className="btn btn-primary">{create.isPending ? 'در حال ثبت...' : 'ثبت درخواست'}</button>}
        <button type="button" className="btn btn-outline" onClick={onCancel}>انصراف</button>
      </div>
    </form>
  )
}
