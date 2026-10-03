'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { addressApi } from '@/lib/api/account'
import { getCompletion } from '@/lib/profile'
import { useAuthStore } from '@/store/auth'

/** Progress card with the remaining steps to complete the customer's profile. */
export function ProfileCompletion({ hideWhenComplete = false }: { hideWhenComplete?: boolean }) {
  const user = useAuthStore((s) => s.user)
  const [addressCount, setAddressCount] = useState<number | null>(null)

  useEffect(() => {
    addressApi.list().then((a) => setAddressCount(a.length)).catch(() => setAddressCount(0))
  }, [])

  if (!user || addressCount === null) return null
  const { items, percent, complete } = getCompletion(user, addressCount)
  if (complete && hideWhenComplete) return null

  return (
    <section className="card p-5" aria-labelledby="completion">
      <div className="flex items-center justify-between gap-3">
        <h2 id="completion" className="font-bold">{complete ? 'پروفایل شما کامل است 🎉' : 'تکمیل پروفایل'}</h2>
        <span className="text-sm font-semibold text-brand-dark">{percent.toLocaleString('fa-IR')}٪</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="درصد تکمیل پروفایل"
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-blush-deep"
      >
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${percent}%` }} />
      </div>
      <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {items.map((i) => (
          <li key={i.key} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${i.done ? 'bg-emerald-100 text-emerald-700' : 'bg-blush-deep text-brand-dark'}`}
            >
              {i.done ? '✓' : '•'}
            </span>
            {i.done ? (
              <span className="text-muted line-through">{i.label}</span>
            ) : (
              <Link href={i.href} className="text-brand-dark hover:underline">{i.label} — تکمیل کنید</Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
