import type { FormEvent } from 'react'
import { Field } from '@/components/ui/Field'
import type { Address } from '../types'

interface Props {
  /** The address being edited, or null for a new one. */
  address: Address | null
  busy: boolean
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export function AddressForm({ address, busy, onSubmit, onCancel }: Props) {
  return (
    <form key={address?.id ?? 'new'} onSubmit={onSubmit} className="card space-y-4 p-5">
      <h2 className="font-bold">{address ? 'ویرایش آدرس' : 'آدرس جدید'}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="نام گیرنده" name="full_name" defaultValue={address?.full_name} required maxLength={150} />
        <Field label="شماره تماس" name="phone_number" defaultValue={address?.phone_number} required maxLength={20} dir="ltr" type="tel" />
        <Field label="شهر" name="city" defaultValue={address?.city} required maxLength={100} />
        <Field label="کد پستی" name="postal_code" defaultValue={address?.postal_code} required maxLength={20} dir="ltr" />
      </div>
      <div>
        <label htmlFor="address_line" className="mb-1.5 block text-sm font-medium">نشانی کامل</label>
        <textarea id="address_line" name="address_line" className="input" rows={3} required maxLength={500} defaultValue={address?.address_line} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_default" defaultChecked={address?.is_default} className="accent-[#8a2b45]" /> آدرس پیش‌فرض
      </label>
      <div className="flex gap-3">
        <button type="submit" disabled={busy} className="btn btn-primary">ذخیره</button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>انصراف</button>
      </div>
    </form>
  )
}
