import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private areas + endless filter/sort/search permutations (duplicate content, wasted crawl budget).
        disallow: ['/account', '/cart', '/checkout', '/login', '/register', '/api/', '/*?q=', '/*?*sort=', '/*?*featured='],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
