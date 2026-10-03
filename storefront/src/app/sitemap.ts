import type { MetadataRoute } from 'next'
import { catalogService } from '@/features/catalog/services/catalogService'
import { absoluteUrl, slugPath } from '@/utils/seo'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/products'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/about'), changeFrequency: 'yearly', priority: 0.4 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly', priority: 0.4 },
  ]

  const categories = (await catalogService.getCategories()).map((c) => ({
    url: absoluteUrl(`/category/${slugPath(c.slug)}`),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const products: MetadataRoute.Sitemap = []
  for (let page = 1; page <= 50; page++) {
    const data = await catalogService.getProducts({ page, page_size: 100 })
    for (const p of data.items) {
      products.push({
        url: absoluteUrl(`/products/${slugPath(p.slug)}`),
        lastModified: new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(p.created_at) ? p.created_at : `${p.created_at}Z`),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
    if (page >= data.pages) break
  }
  return [...pages, ...categories, ...products]
}
