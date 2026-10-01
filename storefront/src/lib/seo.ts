import { SITE_NAME, SITE_URL } from './config'

export const absoluteUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

/** Persian slugs may arrive percent-encoded from the router; normalise to the decoded form. */
export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

/** Percent-encode a (possibly Persian) slug for use inside a URL. */
export const slugPath = (slug: string) => encodeURIComponent(decodeSlug(slug))

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export const siteTitle = (title: string) => `${title} | ${SITE_NAME}`
