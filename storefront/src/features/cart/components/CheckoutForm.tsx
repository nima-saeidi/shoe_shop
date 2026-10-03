'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAuthStore } from '@/app/store/authStore'
import { Alert } from '@/components/ui/Alert'
import { Field } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { useAddresses } from '@/features/addresses/hooks/useAddresses'
import type { Address } from '@/features/addresses/types'
import { useCheckout } from '@/features/orders/hooks/useOrders'
import type { ShippingInfo } from '@/features/orders/types'
import { formatToman, getApiError } from '@/utils/format'
import { useCart } from '../hooks/useCart'

const EMPTY: ShippingInfo = { shipping_full_name: '', shipping_phone: '', shipping_city: '', shipping_address: '', shipping_postal_code: '' }

const fromAddress = (a: Address): ShippingInfo => ({
  shipping_full_name: a.full_name,
  shipping_phone: a.phone_number,
  shipping_city: a.city,
  shipping_address: a.address_line,
  shipping_postal_code: a.postal_code,
})

export function CheckoutForm() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const cartQuery = useCart()
  const addressesQuery = useAddresses()
  const checkout = useCheckout()
  const [ship, setShip] = useState<ShippingInfo>(EMPTY)
  const [payment, setPayment] = useState<'cod' | 'wallet'>('cod')
  const [coupon, setCoupon] = useState('')
  const [notes, setNotes] = useState('')
  const prefilled = useRef(false)

  const cart = cartQuery.data
  const addresses = addressesQuery.data

  // Prefill once: from the default address, else from the profile. Never overwrite what was typed.
  useEffect(() => {
    if (prefilled.current || !addresses) return
    prefilled.current = true
    const def = addresses.find((a) => a.is_default) ?? addresses[0]
    if (def) setShip(fromAddress(def))
    else if (user) setShip((s) => ({ ...s, shipping_full_name: user.full_name, shipping_phone: user.phone_number ?? '' }))
  }, [addresses, user])

  const set = (k: keyof ShippingInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setShip((s) => ({ ...s, [k]: e.target.value }))

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    checkout.mutate(
      {
        ...ship,
        payment_method: payment,
        coupon_code: coupon.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      { onSuccess: (order) => router.replace(`/account/orders/${order.id}?placed=1`) },
    )
  }

  const loadError = cartQuery.error ?? addressesQuery.error
  if ((cartQuery.isPending || addressesQuery.isPending) && !loadError) return <Spinner />
  if (!cart || cart.items.length === 0) {
    return (
      <div className="card mx-auto max-w-lg space-y-4 p-10 text-center">
        {loadError && <Alert>{getApiError(loadError)}</Alert>}
        <p className="font-semibold">سبد خرید شما خالی است.</p>
        <Link href="/products" className="btn btn-primary mt-2">مشاهده محصولات</Link>
      </div>
    )
  }

  const error = checkout.error ?? loadError

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        {error && <Alert>{getApiError(error)}</Alert>}

        <section className="card space-y-4 p-5">
          <h2 className="font-bold">آدرس تحویل</h2>
          {addresses && addresses.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {addresses.map((a) => (
                <button key={a.id} type="button" onClick={() => setShip(fromAddress(a))} className="btn btn-soft !py-1.5 text-xs">
                  {a.city} — {a.address_line.slice(0, 22)}
                </button>
              ))}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نام گیرنده" value={ship.shipping_full_name} onChange={set('shipping_full_name')} required maxLength={150} />
            <Field label="شماره تماس" value={ship.shipping_phone} onChange={set('shipping_phone')} required maxLength={20} dir="ltr" type="tel" />
            <Field label="شهر" value={ship.shipping_city} onChange={set('shipping_city')} required maxLength={100} />
            <Field label="کد پستی" value={ship.shipping_postal_code} onChange={set('shipping_postal_code')} required maxLength={20} dir="ltr" />
          </div>
          <div>
            <label htmlFor="addr" className="mb-1.5 block text-sm font-medium">نشانی کامل</label>
            <textarea id="addr" className="input" rows={3} required maxLength={500} value={ship.shipping_address} onChange={set('shipping_address')} />
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="font-bold">روش پرداخت</h2>
          {([
            ['cod', 'پرداخت در محل'],
            ['wallet', `کیف پول (موجودی: ${formatToman(user?.wallet_balance ?? 0)})`],
          ] as const).map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-3 has-[:checked]:border-brand has-[:checked]:bg-blush">
              <input type="radio" name="payment" checked={payment === value} onChange={() => setPayment(value)} className="accent-[#8a2b45]" />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </section>

        <section className="card space-y-4 p-5">
          <Field label="کد تخفیف (اختیاری)" value={coupon} onChange={(e) => setCoupon(e.target.value)} dir="ltr" />
          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">توضیحات (اختیاری)</label>
            <textarea id="notes" className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </section>
      </div>

      <aside className="card h-fit space-y-4 p-5">
        <h2 className="font-bold">خلاصه سفارش</h2>
        <ul className="space-y-2 text-sm">
          {cart.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-2">
              <span className="text-ink/80">{i.product_name} × {i.quantity.toLocaleString('fa-IR')}</span>
              <span className="shrink-0">{formatToman(i.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-line pt-4 font-semibold">
          <span>جمع کل</span>
          <span>{formatToman(cart.subtotal)}</span>
        </div>
        <button type="submit" disabled={checkout.isPending || checkout.isSuccess} className="btn btn-primary w-full py-3">
          {checkout.isPending || checkout.isSuccess ? 'در حال ثبت...' : 'ثبت نهایی سفارش'}
        </button>
      </aside>
    </form>
  )
}
