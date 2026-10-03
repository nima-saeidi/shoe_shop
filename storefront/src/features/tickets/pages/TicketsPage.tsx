'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Field } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDateTime, getApiError } from '@/utils/format'
import { TICKET_STATUS_FA } from '@/utils/labels'
import { useCreateTicket, useMyTickets } from '../hooks/useTickets'

export function TicketsPage() {
  const { data: tickets, error: loadError } = useMyTickets()
  const create = useCreateTicket()
  const [creating, setCreating] = useState(false)
  const error = loadError ?? create.error

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    create.mutate(
      { subject: String(f.get('subject')).trim(), message: String(f.get('message')).trim() },
      { onSuccess: () => setCreating(false) },
    )
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">تیکت‌های پشتیبانی</h1>
        {!creating && <button type="button" className="btn btn-primary" onClick={() => { create.reset(); setCreating(true) }}>تیکت جدید</button>}
      </div>
      {error && <Alert>{getApiError(error)}</Alert>}

      {creating && (
        <form onSubmit={onSubmit} className="card space-y-4 p-5">
          <h2 className="font-bold">ارسال تیکت جدید</h2>
          <Field label="موضوع" name="subject" required minLength={3} maxLength={200} />
          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium">پیام شما</label>
            <textarea id="message" name="message" className="input" rows={5} required maxLength={2000} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={create.isPending} className="btn btn-primary">{create.isPending ? 'در حال ارسال...' : 'ارسال'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setCreating(false)}>انصراف</button>
          </div>
        </form>
      )}

      {!tickets ? (
        !loadError && <Spinner />
      ) : tickets.length === 0 ? (
        <div className="card p-10 text-center text-muted">هنوز تیکتی ثبت نکرده‌اید.</div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link href={`/account/tickets/${t.id}`} className="card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:border-brand/50">
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
