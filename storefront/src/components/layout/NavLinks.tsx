'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const NAV_ITEMS = [
  { href: '/', label: 'خانه' },
  { href: '/products', label: 'محصولات' },
  { href: '/about', label: 'درباره ما' },
  { href: '/contact', label: 'ارتباط با ما' },
]

export function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export function NavLinks() {
  const pathname = usePathname()
  return (
    <nav aria-label="منوی اصلی" className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`-mb-px border-b-2 px-4 py-3 text-sm transition ${
              active ? 'border-brand font-semibold text-brand' : 'border-transparent text-ink/80 hover:text-brand'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
