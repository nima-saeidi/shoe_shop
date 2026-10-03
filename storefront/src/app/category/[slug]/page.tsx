import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductListing, listingSeo, type ListingParams } from '@/features/catalog/components/ProductListing'
import { catalogService } from '@/features/catalog/services/catalogService'
import { decodeSlug, slugPath } from '@/utils/seo'

export const revalidate = 120

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<ListingParams> }

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const category = await catalogService.getCategoryBySlug(decodeSlug((await params).slug))
  if (!category) return { title: 'دسته‌بندی یافت نشد', robots: { index: false } }

  const base = `/category/${slugPath(category.slug)}`
  const seo = listingSeo(base, await searchParams)
  const description =
    category.description?.slice(0, 160) ||
    `خرید آنلاین ${category.name} زنانه با بهترین قیمت و کیفیت از تولیدی کفش تبریز پانیک؛ ارسال به سراسر ایران.`
  return {
    title: seo.page > 1 ? `${category.name} - صفحه ${seo.page.toLocaleString('fa-IR')}` : `خرید ${category.name}`,
    description,
    alternates: { canonical: seo.canonical },
    robots: seo.robots,
    openGraph: { title: `خرید ${category.name}`, description, type: 'website' },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await catalogService.getCategoryBySlug(decodeSlug((await params).slug))
  if (!category) notFound()

  return (
    <ProductListing
      basePath={`/category/${slugPath(category.slug)}`}
      params={await searchParams}
      category={category}
      title={category.name}
      intro={category.description ?? `مجموعه ${category.name} زنانه پانیک؛ طراحی مدرن، دوخت اصیل تبریز و کیفیت بالا.`}
    />
  )
}
