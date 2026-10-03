'use client'

import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { getApiError } from '@/utils/format'
import { AddressForm } from '../components/AddressForm'
import { useAddresses, useDeleteAddress, useSaveAddress } from '../hooks/useAddresses'
import type { Address, AddressInput } from '../types'

export function AddressesPage() {
  const { data: items, error: loadError } = useAddresses()
  const save = useSaveAddress()
  const remove = useDeleteAddress()
  const [editing, setEditing] = useState<Address | 'new' | null>(null)

  const error = loadError ?? save.error ?? remove.error
  const current = editing && editing !== 'new' ? editing : null

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const input: AddressInput = {
      full_name: String(f.get('full_name')).trim(),
      phone_number: String(f.get('phone_number')).trim(),
      city: String(f.get('city')).trim(),
      address_line: String(f.get('address_line')).trim(),
      postal_code: String(f.get('postal_code')).trim(),
      is_default: f.get('is_default') === 'on',
    }
    save.mutate({ id: current?.id, input }, { onSuccess: () => setEditing(null) })
  }

  function onDelete(a: Address) {
    if (window.confirm('این آدرس حذف شود؟')) remove.mutate(a.id)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">آدرس‌ها</h1>
        {!editing && <button type="button" className="btn btn-primary" onClick={() => { save.reset(); setEditing('new') }}>آدرس جدید</button>}
      </div>
      {error && <Alert>{getApiError(error)}</Alert>}

      {editing && <AddressForm address={current} busy={save.isPending} onSubmit={onSubmit} onCancel={() => setEditing(null)} />}

      {!items ? (
        !loadError && <Spinner />
      ) : items.length === 0 && !editing ? (
        <div className="card p-10 text-center text-muted">آدرسی ثبت نشده است.</div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((a) => (
            <li key={a.id} className="card space-y-2 p-5 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{a.full_name}</p>
                {a.is_default && <span className="rounded-full bg-blush-deep px-2.5 py-0.5 text-xs text-brand-dark">پیش‌فرض</span>}
              </div>
              <p className="text-muted" dir="ltr">{a.phone_number}</p>
              <p>{a.city}، {a.address_line}</p>
              <p className="text-xs text-muted">کد پستی: {a.postal_code}</p>
              <div className="flex gap-4 pt-1">
                <button type="button" className="text-brand-dark" onClick={() => { save.reset(); setEditing(a) }}>ویرایش</button>
                <button type="button" className="text-red-600" disabled={remove.isPending} onClick={() => onDelete(a)}>حذف</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
