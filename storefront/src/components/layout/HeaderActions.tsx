'use client'

import Link from 'next/link'
import { CartIcon, UserIcon } from '@/components/ui/Icons'
import { formatNumber } from '@/lib/format'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

export function HeaderActions() {
  const user = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)
  const count = useCartStore((s) => s.cart?.total_items ?? 0)

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link
        href={hydrated && user ? '/account' : '/login'}
        aria-label={hydrated && user ? 'پنل کاربری' : 'ورود / ثبت‌نام'}
        title={hydrated && user ? user.full_name : 'ورود / ثبت‌نام'}
        className="rounded-full p-2 text-ink transition hover:bg-blush"
      >
        <UserIcon />
      </Link>
      <Link href="/cart" aria-label="سبد خرید" className="relative rounded-full p-2 text-ink transition hover:bg-blush">
        <CartIcon />
        {hydrated && count > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
            {formatNumber(count)}
          </span>
        )}
      </Link>
    </div>
  )
}
