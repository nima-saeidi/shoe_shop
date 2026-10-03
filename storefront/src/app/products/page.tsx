import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import { ProductListing, listingSeo, type ListingParams } from '@/features/catalog/components/ProductListing'
import { catalogService } from '@/features/catalog/services/catalogService'
import { slugPath } from '@/utils/seo'

export const revalidate = 120

type SearchParams = Promise<ListingParams & { category?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams
  const seo = listingSeo('/products', sp)
  // Legacy ?category=ID URLs: point search engines at the category landing page and keep this one out of the index.
  if (sp.category) {
    const cat = (await catalogService.getCategories()).find((c) => String(c.id) === sp.category)
    if (cat) {
      return { title: `خرید ${cat.name}`, alternates: { canonical: `/category/${slugPath(cat.slug)}` }, robots: { index: false, follow: true } }
    }
  }
  const title = sp.q ? `نتایج جستجوی «${sp.q}»` : seo.page > 1 ? `محصولات - صفحه ${seo.page.toLocaleString('fa-IR')}` : 'خرید کفش زنانه'
  return {
    title,
    description: 'خرید آنلاین کفش زنانه: پاشنه‌دار، بوت، صندل و کتانی با طراحی مدرن، کیفیت بالا و ارسال به سراسر ایران. مستقیم از تولیدی کفش تبریز.',
    alternates: { canonical: seo.canonical },
    robots: seo.robots,
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams

  // Legacy /products?category=ID links -> permanent redirect to the indexable category landing page.
  if (sp.category) {
    const cat = (await catalogService.getCategories()).find((c) => String(c.id) === sp.category)
    if (cat) permanentRedirect(`/category/${slugPath(cat.slug)}`)
  }

  return (
    <ProductListing
      basePath="/products"
      params={sp}
      title={sp.q ? `نتایج جستجوی «${sp.q}»` : 'محصولات'}
      intro={sp.q ? undefined : 'مجموعه کامل کفش‌های زنانه پانیک؛ از پاشنه‌دار و بوت تا صندل و کتانی.'}
    />
  )
}
