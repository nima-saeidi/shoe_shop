'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDateTime, getApiError } from '@/utils/format'
import { TICKET_STATUS_FA } from '@/utils/labels'
import { useReplyTicket, useTicket } from '../hooks/useTickets'

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const ticketId = Number(id)
  const { data: ticket, error: loadError } = useTicket(ticketId)
  const reply = useReplyTicket(ticketId)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const message = String(new FormData(form).get('message')).trim()
    if (!message) return
    reply.mutate(message, { onSuccess: () => form.reset() })
  }

  if (!ticket) return loadError ? <Alert>{getApiError(loadError, 'تیکت پیدا نشد.')}</Alert> : <Spinner />

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{ticket.subject}</h1>
        <Link href="/account/tickets" className="text-sm text-brand-dark">‹ همه تیکت‌ها</Link>
      </div>
      <StatusBadge value={ticket.status} labels={TICKET_STATUS_FA} />
      {reply.error && <Alert>{getApiError(reply.error)}</Alert>}

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
        <form onSubmit={onSubmit} className="card space-y-3 p-5">
          <label htmlFor="reply" className="block text-sm font-medium">پاسخ شما</label>
          <textarea id="reply" name="message" className="input" rows={4} required maxLength={2000} />
          <button type="submit" disabled={reply.isPending} className="btn btn-primary">{reply.isPending ? 'در حال ارسال...' : 'ارسال پاسخ'}</button>
        </form>
      )}
    </>
  )
}
