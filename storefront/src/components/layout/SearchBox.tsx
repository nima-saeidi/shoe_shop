'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { SearchIcon } from '@/components/ui/Icons'

export function SearchBox({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [q, setQ] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const term = q.trim()
    router.push(term ? `/products?q=${encodeURIComponent(term)}` : '/products')
  }

  return (
    <form role="search" onSubmit={onSubmit} className={className}>
      <div className="relative">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجوی محصولات، دسته‌بندی‌ها..."
          aria-label="جستجوی محصولات"
          className="w-full rounded-lg border border-line bg-blush py-2.5 pe-4 ps-11 text-sm outline-none transition placeholder:text-muted/70 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15"
        />
        <button type="submit" aria-label="جستجو" className="absolute inset-y-0 start-3 text-muted hover:text-brand">
          <SearchIcon width={18} height={18} />
        </button>
      </div>
    </form>
  )
}
