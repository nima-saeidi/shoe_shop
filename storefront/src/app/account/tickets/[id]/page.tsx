'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ticketApi } from '@/lib/api/account'
import { formatDateTime, getApiError } from '@/lib/format'
import { TICKET_STATUS_FA } from '@/lib/labels'
import type { Ticket } from '@/types'

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    ticketApi.get(Number(id)).then(setTicket).catch((e) => setError(getApiError(e, 'تیکت پیدا نشد.')))
  }, [id])

  async function reply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const message = String(new FormData(form).get('message')).trim()
    if (!message) return
    setBusy(true)
    setError(null)
    try {
      setTicket(await ticketApi.reply(Number(id), message))
      form.reset()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setBusy(false)
    }
  }

  if (!ticket) return error ? <Alert>{error}</Alert> : <Spinner />

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{ticket.subject}</h1>
        <Link href="/account/tickets" className="text-sm text-brand-dark">‹ همه تیکت‌ها</Link>
      </div>
      <StatusBadge value={ticket.status} labels={TICKET_STATUS_FA} />
      {error && <Alert>{error}</Alert>}

      <ul className="space-y-3">
        {ticket.messages.map((m) => (
          <li key={m.id} className={`flex ${m.is_admin ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] rounded-xl p-4 text-sm leading-7 shadow-soft ${m.is_admin ? 'bg-blush-deep' : 'bg-white'}`}>
              <p className="mb-1 text-xs font-semibold text-brand-dark">{m.is_admin ? 'پشتیبانی' : 'شما'}</p>
              <p className="whitespace-pre-line">{m.message}</p>
              <p className="mt-2 text-[11px] text-muted">{formatDateTime(m.created_at)}</p>
            </div>
          </li>
        ))}
      </ul>

      {ticket.status === 'closed' ? (
        <Alert kind="info">این تیکت بسته شده است. برای موضوع جدید، تیکت تازه‌ای ثبت کنید.</Alert>
      ) : (
        <form onSubmit={reply} className="card space-y-3 p-5">
          <label htmlFor="reply" className="block text-sm font-medium">پاسخ شما</label>
          <textarea id="reply" name="message" className="input" rows={4} required maxLength={2000} />
          <button type="submit" disabled={busy} className="btn btn-primary">{busy ? 'در حال ارسال...' : 'ارسال پاسخ'}</button>
        </form>
      )}
    </>
  )
}
