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
    <nav aria-label="منوی اصلی" className="mx-auto hidden items-center gap-1 lg:flex">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(pathname, item.href) ? 'page' : undefined}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            isActive(pathname, item.href) ? 'bg-blush-deep font-semibold text-brand-dark' : 'hover:bg-blush'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
