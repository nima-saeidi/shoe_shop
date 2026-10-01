'use client'

import { useEffect, useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { walletApi } from '@/lib/api/account'
import { formatDateTime, formatToman, getApiError } from '@/lib/format'
import { TX_TYPE_FA } from '@/lib/labels'
import type { WalletTransaction } from '@/types'

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null)
  const [txs, setTxs] = useState<WalletTransaction[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([walletApi.balance(), walletApi.transactions()])
      .then(([b, t]) => {
        setBalance(b.balance)
        setTxs(t)
      })
      .catch((e) => setError(getApiError(e)))
  }, [])

  return (
    <>
      <h1 className="text-2xl font-bold">کیف پول</h1>
      {error && <Alert>{error}</Alert>}
      {balance === null && !error && <Spinner />}
      {balance !== null && (
        <>
          <div className="card bg-gradient-to-l from-[#f3d6d2] to-white p-6">
            <p className="text-sm text-muted">موجودی فعلی</p>
            <p className="mt-2 text-3xl font-extrabold">{formatToman(balance)}</p>
            <p className="mt-3 text-xs text-muted">برای شارژ کیف پول با پشتیبانی تماس بگیرید.</p>
          </div>
          <section className="card p-5">
            <h2 className="mb-3 font-bold">تراکنش‌ها</h2>
            {txs && txs.length > 0 ? (
              <ul className="divide-y divide-blush-deep text-sm">
                {txs.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="font-medium">{TX_TYPE_FA[t.tx_type] ?? t.tx_type}</p>
                      <p className="text-xs text-muted">{t.description ?? ''} {formatDateTime(t.created_at)}</p>
                    </div>
                    <div className="text-end">
                      <p className={t.tx_type === 'topup' || t.tx_type === 'refund' ? 'text-emerald-700' : 'text-red-600'}>
                        {formatToman(t.amount)}
                      </p>
                      <p className="text-xs text-muted">مانده: {formatToman(t.balance_after)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">تراکنشی وجود ندارد.</p>
            )}
          </section>
        </>
      )}
    </>
  )
}
