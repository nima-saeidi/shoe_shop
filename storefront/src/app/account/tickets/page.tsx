'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Field } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ticketApi } from '@/lib/api/account'
import { formatDateTime, getApiError } from '@/lib/format'
import { TICKET_STATUS_FA } from '@/lib/labels'
import type { Ticket } from '@/types'

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = () => ticketApi.mine().then(setTickets).catch((e) => setError(getApiError(e)))
  useEffect(() => {
    load()
  }, [])

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true)
    setError(null)
    try {
      await ticketApi.create(String(f.get('subject')).trim(), String(f.get('message')).trim())
      setCreating(false)
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
        <h1 className="text-2xl font-bold">تیکت‌های پشتیبانی</h1>
        {!creating && <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>تیکت جدید</button>}
      </div>
      {error && <Alert>{error}</Alert>}

      {creating && (
        <form onSubmit={create} className="card space-y-4 p-5">
          <h2 className="font-bold">ارسال تیکت جدید</h2>
          <Field label="موضوع" name="subject" required minLength={3} maxLength={200} />
          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium">پیام شما</label>
            <textarea id="message" name="message" className="input" rows={5} required maxLength={2000} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="btn btn-primary">{busy ? 'در حال ارسال...' : 'ارسال'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setCreating(false)}>انصراف</button>
          </div>
        </form>
      )}

      {!tickets ? (
        !error && <Spinner />
      ) : tickets.length === 0 ? (
        <div className="card p-10 text-center text-muted">هنوز تیکتی ثبت نکرده‌اید.</div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link href={`/account/tickets/${t.id}`} className="card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:-translate-y-0.5">
                <div>
                  <p className="font-semibold">{t.subject}</p>
                  <p className="text-xs text-muted">آخرین به‌روزرسانی: {formatDateTime(t.updated_at)}</p>
                </div>
                <StatusBadge value={t.status} labels={TICKET_STATUS_FA} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
