'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

export const ACCOUNT_ITEMS = [
  { href: '/account', label: 'داشبورد', icon: '⌂' },
  { href: '/account/orders', label: 'سفارش‌های من', icon: '▤' },
  { href: '/account/tickets', label: 'تیکت‌های پشتیبانی', icon: '✉' },
  { href: '/account/returns', label: 'مرجوعی‌ها', icon: '↺' },
  { href: '/account/addresses', label: 'آدرس‌ها', icon: '⌖' },
  { href: '/account/wallet', label: 'کیف پول', icon: '◈' },
  { href: '/account/profile', label: 'پروفایل من', icon: '☺' },
]

const isActive = (pathname: string, href: string) => (href === '/account' ? pathname === href : pathname.startsWith(href))

export function AccountNav() {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [pathname])

  const current = ACCOUNT_ITEMS.find((i) => isActive(pathname, i.href))

  function logout() {
    useAuthStore.getState().logout()
    useCartStore.getState().setCart(null)
    router.replace('/')
  }

  return (
    <aside className="card h-fit overflow-hidden">
      {user && (
        <div className="flex items-center gap-3 border-b border-line bg-blush px-4 py-3">
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-white">
            {user.full_name.trim().charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.full_name}</p>
            <p className="truncate text-xs text-muted" dir="ltr">{user.email}</p>
          </div>
        </div>
      )}

      {/* Mobile / tablet: collapsible menu */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium lg:hidden"
      >
        <span>{current?.label ?? 'منوی پنل کاربری'}</span>
        <span aria-hidden="true" className={`text-xs text-muted transition ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      <nav id="account-menu" aria-label="پنل کاربری" className={`${open ? 'block' : 'hidden'} border-t border-line p-2 lg:block lg:border-t-0`}>
        <ul className="space-y-0.5">
          {ACCOUNT_ITEMS.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active ? 'bg-blush-deep font-semibold text-brand' : 'text-ink/85 hover:bg-blush'
                  }`}
                >
                  <span aria-hidden="true" className="w-5 text-center text-muted">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            )
          })}
          <li>
            <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm text-red-600 hover:bg-red-50">
              <span aria-hidden="true" className="w-5 text-center">⏻</span>
              خروج از حساب
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
