'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDate, getApiError } from '@/utils/format'
import { RETURN_REASON_FA, RETURN_STATUS_FA } from '@/utils/labels'
import { ReturnRequestForm } from '../components/ReturnRequestForm'
import { useMyReturns } from '../hooks/useReturns'

function ReturnsContent() {
  const preselect = Number(useSearchParams().get('order')) || null
  const { data: returns, error } = useMyReturns()
  const [creating, setCreating] = useState(Boolean(preselect))
  const [ok, setOk] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">مرجوعی‌ها</h1>
        {!creating && <button type="button" className="btn btn-primary" onClick={() => { setCreating(true); setOk(false) }}>درخواست مرجوعی</button>}
      </div>
      {ok && <Alert kind="success">درخواست مرجوعی ثبت شد و به‌زودی بررسی می‌شود.</Alert>}
      {error && <Alert>{getApiError(error)}</Alert>}

      {creating && (
        <ReturnRequestForm
          preselectOrderId={preselect}
          onDone={() => {
            setCreating(false)
            setOk(true)
          }}
          onCancel={() => setCreating(false)}
        />
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

export function ReturnsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ReturnsContent />
    </Suspense>
  )
}
