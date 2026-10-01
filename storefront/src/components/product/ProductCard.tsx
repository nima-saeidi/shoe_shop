import Image from 'next/image'
import Link from 'next/link'
import { Price } from '@/components/ui/Price'
import { mediaUrl } from '@/lib/media'
import { slugPath } from '@/lib/seo'
import type { Product } from '@/types'

export function primaryImage(product: Product) {
  return product.images.find((i) => i.is_primary) ?? product.images[0]
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const img = primaryImage(product)
  const src = mediaUrl(img?.image_url)
  const inStock = product.variants.some((v) => v.stock_quantity > 0)

  return (
    <article className="card group flex flex-col overflow-hidden p-2.5 transition hover:-translate-y-0.5">
      <Link href={`/products/${slugPath(product.slug)}`} className="relative block aspect-square overflow-hidden rounded-2xl bg-blush">
        {src ? (
          <Image
            src={src}
            alt={img?.alt_text || product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-muted">بدون تصویر</span>
        )}
        {!inStock && (
          <span className="absolute start-2 top-2 rounded-full bg-ink/80 px-2.5 py-0.5 text-[11px] text-white">ناموجود</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 px-1.5 pb-1 pt-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5">
          <Link href={`/products/${slugPath(product.slug)}`}>{product.name}</Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2">
          <Price price={product.price} discount={product.discount_price} />
          <Link href={`/products/${slugPath(product.slug)}`} className="btn btn-primary !px-3 !py-1.5 text-xs">
            مشاهده
          </Link>
        </div>
      </div>
    </article>
  )
}
