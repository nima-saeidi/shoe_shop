'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { formatNumber, formatToman, getApiError } from '@/utils/format'
import { mediaUrl } from '@/utils/media'
import { useCart, useRemoveCartItem, useUpdateCartItem } from '../hooks/useCart'

export function CartView() {
  const { data: cart, isPending, error: loadError } = useCart()
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()

  // The row that has a request in flight gets its buttons disabled.
  const busyId = update.isPending ? update.variables?.itemId : remove.isPending ? remove.variables : null
  const error = loadError ?? update.error ?? remove.error

  if (isPending && !loadError) return <Spinner />

  if (!cart || cart.items.length === 0) {
    return (
      <div className="card mx-auto max-w-lg space-y-4 p-10 text-center">
        {loadError && <Alert>{getApiError(loadError)}</Alert>}
        <p className="text-lg font-semibold">سبد خرید شما خالی است</p>
        <Link href="/products" className="btn btn-primary mt-2">مشاهده محصولات</Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-3">
        {error && <Alert>{getApiError(error)}</Alert>}
        <ul className="space-y-3">
          {cart.items.map((item) => {
            const src = mediaUrl(item.image_url)
            const busy = busyId === item.id
            return (
              <li key={item.id} className="card flex gap-4 p-3">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-blush">
                  {src && <Image src={src} alt={item.product_name} fill sizes="96px" className="object-cover" />}
                </div>
                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted">سایز {item.size} · رنگ {item.color}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center rounded-full border border-line">
                      <button
                        type="button"
                        aria-label="کاهش تعداد"
                        disabled={busy || item.quantity <= 1}
                        onClick={() => update.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                        className="px-3 py-1 disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm">{formatNumber(item.quantity)}</span>
                      <button
                        type="button"
                        aria-label="افزایش تعداد"
                        disabled={busy}
                        onClick={() => update.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                        className="px-3 py-1 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-semibold">{formatToman(item.line_total)}</span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove.mutate(item.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <aside className="card h-fit space-y-4 p-5">
        <h2 className="font-bold">خلاصه سفارش</h2>
        <div className="flex justify-between text-sm">
          <span className="text-muted">تعداد کالا</span>
          <span>{formatNumber(cart.total_items)}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-4 font-semibold">
          <span>جمع کل</span>
          <span>{formatToman(cart.subtotal)}</span>
        </div>
        <Link href="/checkout" className="btn btn-primary w-full py-3">ادامه و ثبت سفارش</Link>
      </aside>
    </div>
  )
}
