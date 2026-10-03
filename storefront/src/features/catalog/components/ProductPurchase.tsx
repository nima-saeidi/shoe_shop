'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert } from '@/components/ui/Alert'
import { Price } from '@/components/ui/Price'
import { cartApi } from '@/lib/api/account'
import { getApiError } from '@/lib/format'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/types'

/** Color + size picker and add-to-cart. Variants are the unit that gets purchased. */
export function ProductPurchase({ product, onColorChange }: { product: Product; onColorChange?: (color: string) => void }) {
  const router = useRouter()
  const colors = useMemo(() => Array.from(new Set(product.variants.map((v) => v.color))), [product.variants])
  const [color, setColor] = useState(colors[0] ?? '')
  const [variantId, setVariantId] = useState<number | null>(null)
  const [qty, setQty] = useState(1)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)

  const sizes = product.variants.filter((v) => v.color === color)
  const selected = product.variants.find((v) => v.id === variantId)
  const unit = selected ? product.discount_price ?? product.price : null

  async function addToCart() {
    if (!useAuthStore.getState().accessToken) {
      router.push(`/login?next=${encodeURIComponent(`/products/${product.slug}`)}`)
      return
    }
    if (!selected) {
      setMsg({ kind: 'error', text: 'لطفاً سایز را انتخاب کنید.' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const cart = await cartApi.add(selected.id, qty)
      useCartStore.getState().setCart(cart)
      setMsg({ kind: 'success', text: 'به سبد خرید اضافه شد.' })
    } catch (e) {
      setMsg({ kind: 'error', text: getApiError(e) })
    } finally {
      setBusy(false)
    }
  }

  if (product.variants.length === 0) return <Alert kind="info">این محصول در حال حاضر موجود نیست.</Alert>

  return (
    <div className="space-y-5">
      <Price price={product.price} discount={product.discount_price} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium">رنگ</legend>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={c === color}
              onClick={() => {
                setColor(c)
                setVariantId(null)
                onColorChange?.(c)
              }}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                c === color ? 'border-brand bg-blush-deep font-semibold text-brand-dark' : 'border-line bg-white hover:border-brand/50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">سایز</legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((v) => {
            const out = v.stock_quantity <= 0
            return (
              <button
                key={v.id}
                type="button"
                disabled={out}
                aria-pressed={v.id === variantId}
                onClick={() => {
                  setVariantId(v.id)
                  setQty((q) => Math.min(q, Math.max(v.stock_quantity, 1)))
                }}
                className={`min-w-12 rounded-xl border px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:text-muted/40 disabled:line-through ${
                  v.id === variantId ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:border-brand/50'
                }`}
              >
                {v.size}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-line bg-white">
          <button type="button" aria-label="کاهش تعداد" className="px-4 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span className="w-8 text-center text-sm" aria-live="polite">{qty.toLocaleString('fa-IR')}</span>
          <button
            type="button"
            aria-label="افزایش تعداد"
            className="px-4 py-2"
            onClick={() => setQty((q) => Math.min(selected?.stock_quantity ?? 99, q + 1))}
          >
            +
          </button>
        </div>
        <button type="button" onClick={addToCart} disabled={busy} className="btn btn-primary flex-1 py-3">
          {busy ? 'در حال افزودن...' : 'افزودن به سبد خرید'}
        </button>
      </div>

      {selected && unit != null && selected.stock_quantity <= 5 && (
        <p className="text-xs text-brand-dark">فقط {selected.stock_quantity.toLocaleString('fa-IR')} عدد در انبار باقی مانده است.</p>
      )}
      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
    </div>
  )
}
