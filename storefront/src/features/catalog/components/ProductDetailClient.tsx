'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { mediaUrl } from '@/lib/media'
import type { Product } from '@/types'
import { ProductPurchase } from './ProductPurchase'

/** Gallery + purchase panel. Picking a color jumps the gallery to that color's photos. */
export function ProductDetailClient({ product }: { product: Product }) {
  const [color, setColor] = useState<string | null>(null)

  const images = useMemo(() => {
    const sorted = [...product.images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
    const forColor = color ? sorted.filter((i) => i.color === color) : []
    return forColor.length ? [...forColor, ...sorted.filter((i) => !forColor.includes(i))] : sorted
  }, [product.images, color])

  const [activeId, setActiveId] = useState<number | null>(null)
  const active = images.find((i) => i.id === activeId) ?? images[0]
  const activeSrc = mediaUrl(active?.image_url)

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="card relative aspect-square overflow-hidden">
          {activeSrc ? (
            <Image
              src={activeSrc}
              alt={active?.alt_text || product.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-muted">بدون تصویر</span>
          )}
        </div>
        {images.length > 1 && (
          <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((img) => {
              const src = mediaUrl(img.image_url)
              if (!src) return null
              return (
                <li key={img.id}>
                  <button
                    type="button"
                    aria-label="نمایش تصویر"
                    aria-pressed={img.id === active?.id}
                    onClick={() => setActiveId(img.id)}
                    className={`relative block h-16 w-16 overflow-hidden rounded-xl border-2 ${
                      img.id === active?.id ? 'border-brand' : 'border-transparent'
                    }`}
                  >
                    <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="card h-fit p-6">
        <ProductPurchase
          product={product}
          onColorChange={(c) => {
            setColor(c)
            setActiveId(null)
          }}
        />
      </div>
    </div>
  )
}
