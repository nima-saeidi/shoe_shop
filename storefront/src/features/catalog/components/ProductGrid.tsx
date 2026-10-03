import type { Product } from '@/types'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products, priorityCount = 0 }: { products: Product[]; priorityCount?: number }) {
  if (products.length === 0) {
    return <p className="card p-10 text-center text-muted">محصولی برای نمایش وجود ندارد.</p>
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  )
}
