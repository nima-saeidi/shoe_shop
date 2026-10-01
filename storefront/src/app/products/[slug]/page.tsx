import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'
import { ProductGrid } from '@/components/product/ProductGrid'
import { primaryImage } from '@/components/product/ProductCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { getProductBySlug, getProducts, getReviews } from '@/lib/api/catalog'
import { SITE_NAME } from '@/lib/config'
import { formatDate, formatToman } from '@/lib/format'
import { absoluteUrl, breadcrumbJsonLd, decodeSlug, slugPath } from '@/lib/seo'

export const revalidate = 120

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProductBySlug(decodeSlug((await params).slug))
  if (!product) return { title: 'محصول یافت نشد', robots: { index: false } }

  const img = primaryImage(product)
  const price = product.discount_price ?? product.price
  const description = (
    product.description?.replace(/\s+/g, ' ').trim() ||
    `خرید ${product.name} از برند ${product.brand.name} با قیمت ${formatToman(price)}؛ ارسال به سراسر ایران از ${SITE_NAME}.`
  ).slice(0, 160)
  const images = img ? [{ url: absoluteUrl(img.image_url), alt: product.name }] : undefined
  const path = `/products/${slugPath(product.slug)}`

  return {
    title: `خرید ${product.name}`,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', url: path, title: product.name, description, images },
    twitter: { card: 'summary_large_image', title: product.name, description, images: images?.map((i) => i.url) },
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProductBySlug(decodeSlug((await params).slug))
  if (!product) notFound()

  const [relatedPage, reviews] = await Promise.all([
    getProducts({ category_id: product.category_id, page_size: 5 }),
    getReviews(product.id),
  ])
  const related = relatedPage.items.filter((p) => p.id !== product.id).slice(0, 4)

  const url = `/products/${slugPath(product.slug)}`
  const categoryPath = `/category/${slugPath(product.category.slug)}`
  const inStock = product.variants.some((v) => v.stock_quantity > 0)
  const ratingCount = reviews.length
  const ratingAvg = ratingCount ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0
  const nextYear = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10)

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': absoluteUrl(`${url}#product`),
    name: product.name,
    description: product.description || product.name,
    sku: product.sku,
    mpn: product.sku,
    brand: { '@type': 'Brand', name: product.brand.name },
    category: product.category.name,
    image: product.images.map((i) => absoluteUrl(i.image_url)),
    color: Array.from(new Set(product.variants.map((v) => v.color))).join('، ') || undefined,
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(url),
      priceCurrency: 'IRR',
      // Prices are stored in Toman; schema.org expects the ISO currency (Rial) amount.
      price: Math.round((product.discount_price ?? product.price) * 10),
      priceValidUntil: nextYear,
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
    // Only real, approved customer reviews are exposed as rich-result data.
    ...(ratingCount > 0 && {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: ratingAvg.toFixed(1), reviewCount: ratingCount },
      review: reviews.slice(0, 5).map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.customer_name || 'مشتری' },
        datePublished: r.created_at,
        reviewBody: r.comment || undefined,
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      })),
    }),
  }

  return (
    <div className="space-y-10">
      <nav aria-label="مسیر صفحه" className="text-sm text-muted">
        <Link href="/" className="hover:text-brand-dark">خانه</Link> ‹{' '}
        <Link href="/products" className="hover:text-brand-dark">محصولات</Link> ‹{' '}
        <Link href={categoryPath} className="hover:text-brand-dark">{product.category.name}</Link>
      </nav>

      <ProductDetailClient product={product} />

      <section className="card p-6">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        {ratingCount > 0 && (
          <p className="mt-2 text-sm text-brand-dark">
            ★ {ratingAvg.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}{' '}
            <span className="text-muted">({ratingCount.toLocaleString('fa-IR')} نظر)</span>
          </p>
        )}
        <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-sm text-muted">
          <div className="flex gap-1"><dt>برند:</dt><dd className="text-ink">{product.brand.name}</dd></div>
          <div className="flex gap-1"><dt>دسته‌بندی:</dt><dd><Link href={categoryPath} className="text-ink hover:text-brand-dark">{product.category.name}</Link></dd></div>
          <div className="flex gap-1"><dt>کد کالا:</dt><dd className="text-ink" dir="ltr">{product.sku}</dd></div>
        </dl>
        {product.description && <p className="mt-5 whitespace-pre-line leading-8 text-ink/80">{product.description}</p>}
      </section>

      {ratingCount > 0 && (
        <section aria-labelledby="reviews" className="card p-6">
          <h2 id="reviews" className="mb-4 text-xl font-bold">نظرات مشتریان</h2>
          <ul className="divide-y divide-blush-deep">
            {reviews.map((r) => (
              <li key={r.id} className="py-3 text-sm">
                <p className="flex items-center justify-between">
                  <span className="font-medium">{r.customer_name || 'مشتری'}</span>
                  <span className="text-brand-dark" aria-label={`امتیاز ${r.rating} از ۵`}>
                    {'★'.repeat(r.rating)}<span className="text-blush-deep">{'★'.repeat(5 - r.rating)}</span>
                  </span>
                </p>
                {r.comment && <p className="mt-1 leading-7 text-ink/80">{r.comment}</p>}
                <p className="mt-1 text-xs text-muted">{formatDate(r.created_at)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related">
          <h2 id="related" className="mb-5 text-xl font-bold">محصولات مرتبط</h2>
          <ProductGrid products={related} />
        </section>
      )}

      <JsonLd
        data={[
          productJsonLd,
          breadcrumbJsonLd([
            { name: 'خانه', path: '/' },
            { name: 'محصولات', path: '/products' },
            { name: product.category.name, path: categoryPath },
            { name: product.name, path: url },
          ]),
        ]}
      />
    </div>
  )
}
