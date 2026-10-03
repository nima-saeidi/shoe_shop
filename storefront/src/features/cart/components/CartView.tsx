'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { cartApi } from '@/lib/api/account'
import { formatNumber, formatToman, getApiError } from '@/lib/format'
import { mediaUrl } from '@/lib/media'
import { useCartStore } from '@/store/cart'

export function CartView() {
  const cart = useCartStore((s) => s.cart)
  const setCart = useCartStore((s) => s.setCart)
  const [loading, setLoading] = useState(!cart)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cartApi
      .get()
      .then(setCart)
      .catch((e) => setError(getApiError(e)))
      .finally(() => setLoading(false))
  }, [setCart])

  async function run(itemId: number, action: () => Promise<typeof cart>) {
    setBusyId(itemId)
    setError(null)
    try {
      setCart(await action())
    } catch (e) {
      setError(getApiError(e))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Spinner />

  if (!cart || cart.items.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <p className="text-lg font-semibold">سبد خرید شما خالی است</p>
        <Link href="/products" className="btn btn-primary mt-6">مشاهده محصولات</Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-3">
        {error && <Alert>{error}</Alert>}
        <ul className="space-y-3">
          {cart.items.map((item) => {
            const src = mediaUrl(item.image_url)
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
                        disabled={busyId === item.id || item.quantity <= 1}
                        onClick={() => run(item.id, () => cartApi.update(item.id, item.quantity - 1))}
                        className="px-3 py-1 disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm">{formatNumber(item.quantity)}</span>
                      <button
                        type="button"
                        aria-label="افزایش تعداد"
                        disabled={busyId === item.id}
                        onClick={() => run(item.id, () => cartApi.update(item.id, item.quantity + 1))}
                        className="px-3 py-1 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-semibold">{formatToman(item.line_total)}</span>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => run(item.id, () => cartApi.remove(item.id))}
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
