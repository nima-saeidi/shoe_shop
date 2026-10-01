'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Field } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { addressApi } from '@/lib/api/account'
import { getApiError } from '@/lib/format'
import type { Address, AddressInput } from '@/types'

export default function AddressesPage() {
  const [items, setItems] = useState<Address[] | null>(null)
  const [editing, setEditing] = useState<Address | 'new' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = () => addressApi.list().then(setItems).catch((e) => setError(getApiError(e)))
  useEffect(() => {
    load()
  }, [])

  async function save(e: FormEvent<HTMLFormElement>) {
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
    setBusy(true)
    setError(null)
    try {
      if (editing && editing !== 'new') await addressApi.update(editing.id, input)
      else await addressApi.create(input)
      setEditing(null)
      await load()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setBusy(false)
    }
  }

  async function remove(a: Address) {
    if (!window.confirm('این آدرس حذف شود؟')) return
    try {
      await addressApi.remove(a.id)
      await load()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const current = editing && editing !== 'new' ? editing : null

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">آدرس‌ها</h1>
        {!editing && <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>آدرس جدید</button>}
      </div>
      {error && <Alert>{error}</Alert>}

      {editing && (
        <form key={current?.id ?? 'new'} onSubmit={save} className="card space-y-4 p-5">
          <h2 className="font-bold">{current ? 'ویرایش آدرس' : 'آدرس جدید'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نام گیرنده" name="full_name" defaultValue={current?.full_name} required maxLength={150} />
            <Field label="شماره تماس" name="phone_number" defaultValue={current?.phone_number} required maxLength={20} dir="ltr" type="tel" />
            <Field label="شهر" name="city" defaultValue={current?.city} required maxLength={100} />
            <Field label="کد پستی" name="postal_code" defaultValue={current?.postal_code} required maxLength={20} dir="ltr" />
          </div>
          <div>
            <label htmlFor="address_line" className="mb-1.5 block text-sm font-medium">نشانی کامل</label>
            <textarea id="address_line" name="address_line" className="input" rows={3} required maxLength={500} defaultValue={current?.address_line} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_default" defaultChecked={current?.is_default} className="accent-[#c9737f]" /> آدرس پیش‌فرض
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="btn btn-primary">ذخیره</button>
            <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>انصراف</button>
          </div>
        </form>
      )}

      {!items ? (
        !error && <Spinner />
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
                <button type="button" className="text-brand-dark" onClick={() => setEditing(a)}>ویرایش</button>
                <button type="button" className="text-red-600" onClick={() => remove(a)}>حذف</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
