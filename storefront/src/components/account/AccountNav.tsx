'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'

const ITEMS = [
  { href: '/account', label: 'داشبورد' },
  { href: '/account/orders', label: 'سفارش‌های من' },
  { href: '/account/returns', label: 'مرجوعی‌ها' },
  { href: '/account/tickets', label: 'تیکت‌های پشتیبانی' },
  { href: '/account/addresses', label: 'آدرس‌ها' },
  { href: '/account/wallet', label: 'کیف پول' },
  { href: '/account/profile', label: 'پروفایل من' },
]

export function AccountNav() {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  function logout() {
    useAuthStore.getState().logout()
    useCartStore.getState().setCart(null)
    router.replace('/')
  }

  return (
    <aside className="card h-fit p-4">
      {user && (
        <div className="mb-3 border-b border-blush-deep pb-3">
          <p className="font-semibold">{user.full_name}</p>
          <p className="text-xs text-muted" dir="ltr">{user.email}</p>
        </div>
      )}
      <nav aria-label="پنل کاربری" className="flex gap-1 overflow-x-auto lg:flex-col">
        {ITEMS.map((item) => {
          const active = item.href === '/account' ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm transition ${active ? 'bg-blush-deep font-semibold text-brand-dark' : 'hover:bg-blush'}`}
            >
              {item.label}
            </Link>
          )
        })}
        <button type="button" onClick={logout} className="whitespace-nowrap rounded-xl px-4 py-2 text-start text-sm text-red-600 hover:bg-red-50">
          خروج از حساب
        </button>
      </nav>
    </aside>
  )
}
