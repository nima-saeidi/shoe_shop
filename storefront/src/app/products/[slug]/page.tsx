import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { primaryImage } from '@/features/catalog/components/ProductCard'
import { ProductDetailPage } from '@/features/catalog/pages/ProductDetailPage'
import { catalogService } from '@/features/catalog/services/catalogService'
import { SITE_NAME } from '@/utils/config'
import { formatToman } from '@/utils/format'
import { absoluteUrl, decodeSlug, slugPath } from '@/utils/seo'

export const revalidate = 120

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await catalogService.getProductBySlug(decodeSlug((await params).slug))
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
  const product = await catalogService.getProductBySlug(decodeSlug((await params).slug))
  if (!product) notFound()
  return <ProductDetailPage product={product} />
}
