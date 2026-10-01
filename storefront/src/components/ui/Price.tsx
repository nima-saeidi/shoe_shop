import { formatToman } from '@/lib/format'

export function Price({ price, discount }: { price: number; discount?: number | null }) {
  const hasDiscount = discount != null && discount > 0 && discount < price
  return (
    <span className="flex flex-col leading-tight">
      {hasDiscount && <del className="text-xs text-muted">{formatToman(price)}</del>}
      <span className="text-sm font-semibold text-ink">{formatToman(hasDiscount ? discount : price)}</span>
    </span>
  )
}
