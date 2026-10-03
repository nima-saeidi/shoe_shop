import Link from 'next/link'
import { JsonLd } from '@/components/ui/JsonLd'
import { catalogService } from '../services/catalogService'
import { absoluteUrl, breadcrumbJsonLd, slugPath } from '@/utils/seo'
import type { Category } from '../types'
import { primaryImage } from './ProductCard'
import { ProductGrid } from './ProductGrid'

export const SORTS = [
  { value: 'created_at_desc', label: 'جدیدترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
]

export const PAGE_SIZE = 12

export interface ListingParams {
  q?: string
  featured?: string
  sort?: string
  page?: string
}

function build(basePath: string, params: Record<string, string | undefined>) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v)
  const s = qs.toString()
  return s ? `${basePath}?${s}` : basePath
}

/** Shared by /products and /category/[slug]: heading, filters, grid, pagination and ItemList structured data. */
export async function ProductListing({
  basePath,
  params,
  category,
  title,
  intro,
}: {
  basePath: string
  params: ListingParams
  category?: Category | null
  title: string
  intro?: string
}) {
  const page = Math.max(1, Number(params.page) || 1)
  const sort = SORTS.some((s) => s.value === params.sort) ? params.sort! : 'created_at_desc'

  const [data, categories] = await Promise.all([
    catalogService.getProducts({
      q: params.q || undefined,
      category_id: category?.id,
      is_featured: params.featured === '1' ? true : undefined,
      order_by: sort,
      page,
      page_size: PAGE_SIZE,
    }),
    catalogService.getCategories(),
  ])

  const keep = { q: params.q, featured: params.featured, sort: params.sort }

  const crumbs = [
    { name: 'خانه', path: '/' },
    { name: 'محصولات', path: '/products' },
    ...(category ? [{ name: category.name, path: `/category/${slugPath(category.slug)}` }] : []),
  ]
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: data.items.map((p, i) => ({
      '@type': 'ListItem',
      position: (page - 1) * PAGE_SIZE + i + 1,
      url: absoluteUrl(`/products/${slugPath(p.slug)}`),
      name: p.name,
      image: primaryImage(p) ? absoluteUrl(primaryImage(p)!.image_url) : undefined,
    })),
  }

  return (
    <div className="space-y-6">
      <nav aria-label="مسیر صفحه" className="text-sm text-muted">
        <Link href="/" className="hover:text-brand-dark">خانه</Link> ‹{' '}
        {category ? (
          <>
            <Link href="/products" className="hover:text-brand-dark">محصولات</Link> ‹ <span className="text-ink">{category.name}</span>
          </>
        ) : (
          <span className="text-ink">محصولات</span>
        )}
      </nav>

      <header>
        <h1 className="text-2xl font-bold">{title}</h1>
        {intro && <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/75">{intro}</p>}
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="دسته‌بندی" className="flex flex-wrap gap-2">
          <Link href="/products" className={`btn ${!category ? 'btn-primary' : 'btn-soft'}`}>همه</Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${slugPath(c.slug)}`}
              className={`btn ${category?.id === c.id ? 'btn-primary' : 'btn-soft'}`}
            >
              {c.name}
            </Link>
          ))}
        </nav>
        <nav aria-label="مرتب‌سازی" className="flex items-center gap-2 text-sm">
          <span className="text-muted">مرتب‌سازی:</span>
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={build(basePath, { ...keep, sort: s.value === 'created_at_desc' ? undefined : s.value })}
              rel="nofollow"
              aria-current={sort === s.value ? 'true' : undefined}
              className={sort === s.value ? 'font-bold text-brand-dark' : 'text-muted hover:text-brand-dark'}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>

      <ProductGrid products={data.items} priorityCount={4} />

      {data.pages > 1 && (
        <nav aria-label="صفحه‌بندی" className="flex items-center justify-center gap-3 pt-2">
          {page > 1 && (
            <Link rel="prev" href={build(basePath, { ...keep, page: page > 2 ? String(page - 1) : undefined })} className="btn btn-soft">
              قبلی
            </Link>
          )}
          <span className="text-sm text-muted">
            صفحه {page.toLocaleString('fa-IR')} از {data.pages.toLocaleString('fa-IR')}
          </span>
          {page < data.pages && (
            <Link rel="next" href={build(basePath, { ...keep, page: String(page + 1) })} className="btn btn-soft">
              بعدی
            </Link>
          )}
        </nav>
      )}

      <JsonLd data={[breadcrumbJsonLd(crumbs), itemList]} />
    </div>
  )
}

/** Canonical + robots for listing pages: filtered/sorted/search views are not indexed; pages are. */
export function listingSeo(basePath: string, params: ListingParams) {
  const page = Math.max(1, Number(params.page) || 1)
  const filtered = Boolean(params.q || params.featured || (params.sort && params.sort !== 'created_at_desc'))
  return {
    canonical: page > 1 && !filtered ? `${basePath}?page=${page}` : basePath,
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
    page,
  }
}
