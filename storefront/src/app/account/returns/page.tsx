'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { orderApi, returnApi } from '@/lib/api/account'
import { formatDate, getApiError } from '@/lib/format'
import { RETURN_REASON_FA, RETURN_STATUS_FA } from '@/lib/labels'
import type { Order, ReturnRequest } from '@/types'

function ReturnsContent() {
  const preselect = Number(useSearchParams().get('order')) || null
  const [returns, setReturns] = useState<ReturnRequest[] | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [creating, setCreating] = useState(Boolean(preselect))
  const [orderId, setOrderId] = useState<number | null>(preselect)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  const load = () => returnApi.mine().then(setReturns).catch((e) => setError(getApiError(e)))

  useEffect(() => {
    load()
    orderApi
      .mine(1, 50)
      .then((p) => setOrders(p.items.filter((o) => o.status === 'delivered')))
      .catch(() => undefined)
  }, [])

  const order = orders.find((o) => o.id === orderId)

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const itemId = Number(f.get('item'))
    if (!itemId) return setError('کالای موردنظر را انتخاب کنید.')
    setBusy(true)
    setError(null)
    try {
      await returnApi.create(itemId, String(f.get('reason')), String(f.get('description')).trim() || undefined)
      setCreating(false)
      setOk(true)
      await load()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">مرجوعی‌ها</h1>
        {!creating && <button type="button" className="btn btn-primary" onClick={() => { setCreating(true); setOk(false) }}>درخواست مرجوعی</button>}
      </div>
      {ok && <Alert kind="success">درخواست مرجوعی ثبت شد و به‌زودی بررسی می‌شود.</Alert>}
      {error && <Alert>{error}</Alert>}

      {creating && (
        <form onSubmit={create} className="card space-y-4 p-5">
          <h2 className="font-bold">درخواست مرجوعی جدید</h2>
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
            {order && <button type="submit" disabled={busy} className="btn btn-primary">{busy ? 'در حال ثبت...' : 'ثبت درخواست'}</button>}
            <button type="button" className="btn btn-outline" onClick={() => setCreating(false)}>انصراف</button>
          </div>
        </form>
      )}

      {!returns ? (
        !error && <Spinner />
      ) : returns.length === 0 ? (
        <div className="card p-10 text-center text-muted">درخواست مرجوعی‌ای ثبت نشده است.</div>
      ) : (
        <ul className="space-y-3">
          {returns.map((r) => (
            <li key={r.id} className="card space-y-2 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{r.product_name}<span className="text-xs font-normal text-muted"> — سایز {r.size}، {r.color}</span></p>
                <StatusBadge value={r.status} labels={RETURN_STATUS_FA} />
              </div>
              <p className="text-muted">
                سفارش <Link href={`/account/orders/${r.order_id}`} className="text-brand-dark" dir="ltr">{r.order_number}</Link> · {formatDate(r.created_at)}
              </p>
              <p>دلیل: {RETURN_REASON_FA[r.reason] ?? r.reason}</p>
              {r.description && <p className="text-ink/80">{r.description}</p>}
              {r.admin_note && <p className="rounded-xl bg-blush p-3">پاسخ فروشگاه: {r.admin_note}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default function ReturnsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ReturnsContent />
    </Suspense>
  )
}
