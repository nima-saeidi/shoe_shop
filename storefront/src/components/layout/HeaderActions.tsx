'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { CartIcon, UserIcon } from '@/components/ui/Icons'
import { formatNumber } from '@/lib/format'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

export const ACCOUNT_LINKS = [
  { href: '/account', label: 'داشبورد' },
  { href: '/account/orders', label: 'سفارش‌های من' },
  { href: '/account/tickets', label: 'تیکت‌های پشتیبانی' },
  { href: '/account/returns', label: 'مرجوعی‌ها' },
  { href: '/account/addresses', label: 'آدرس‌ها' },
  { href: '/account/wallet', label: 'کیف پول' },
  { href: '/account/profile', label: 'پروفایل من' },
]

function UserMenu() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function logout() {
    useAuthStore.getState().logout()
    useCartStore.getState().setCart(null)
    setOpen(false)
    router.replace('/')
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-sm transition hover:border-brand/40"
      >
        <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
          {(user?.full_name ?? '؟').trim().charAt(0)}
        </span>
        <span className="hidden max-w-28 truncate sm:block">{user?.full_name ?? 'حساب من'}</span>
        <span aria-hidden="true" className="text-[10px] text-muted">▾</span>
      </button>

      {open && (
        <div role="menu" className="absolute end-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-white shadow-xl">
          {user && (
            <div className="border-b border-line bg-blush px-4 py-3">
              <p className="truncate text-sm font-semibold">{user.full_name}</p>
              <p className="truncate text-xs text-muted" dir="ltr">{user.email}</p>
            </div>
          )}
          <ul className="py-1 text-sm">
            {ACCOUNT_LINKS.map((l) => (
              <li key={l.href}>
                <Link role="menuitem" href={l.href} onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-blush hover:text-brand">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" role="menuitem" onClick={logout} className="w-full border-t border-line px-4 py-2.5 text-start text-sm text-red-600 hover:bg-red-50">
            خروج از حساب
          </button>
        </div>
      )}
    </div>
  )
}

export function HeaderActions() {
  const user = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)
  const count = useCartStore((s) => s.cart?.total_items ?? 0)
  const loggedIn = hydrated && Boolean(user)

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {loggedIn ? (
        <UserMenu />
      ) : (
        <Link href="/login" className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm transition hover:border-brand/40 hover:text-brand">
          <UserIcon width={18} height={18} />
          <span className="hidden sm:block">ورود / ثبت‌نام</span>
        </Link>
      )}
      <Link href="/cart" aria-label="سبد خرید" className="relative flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm text-white transition hover:bg-brand-dark">
        <CartIcon width={18} height={18} />
        <span className="hidden sm:block">سبد خرید</span>
        {hydrated && count > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-brand">
            {formatNumber(count)}
          </span>
        )}
      </Link>
    </div>
  )
}
