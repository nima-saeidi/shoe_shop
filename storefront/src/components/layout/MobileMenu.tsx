'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CloseIcon, MenuIcon } from '@/components/ui/Icons'

export function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  return (
    <div className="lg:hidden">
      <button type="button" aria-label="باز کردن منو" aria-expanded={open} onClick={() => setOpen(true)} className="p-1 text-brand-dark">
        <MenuIcon />
      </button>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="منو">
          <button type="button" aria-label="بستن منو" className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-72 bg-white p-6 shadow-xl">
            <button type="button" aria-label="بستن" onClick={() => setOpen(false)} className="mb-6 text-brand-dark">
              <CloseIcon />
            </button>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-xl px-4 py-3 hover:bg-blush">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/account" className="block rounded-xl px-4 py-3 hover:bg-blush">
                  پنل کاربری
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
