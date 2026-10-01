import Link from 'next/link'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/config'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${SITE_NAME} — ${SITE_TAGLINE}`} className={`flex items-center gap-2 ${className}`} dir="ltr">
      <svg viewBox="0 0 40 48" width="30" height="36" aria-hidden="true">
        <path d="M6 4c6-3 14 0 14 9 0 7 4 12 14 15v6c-9 0-17-1-24-5-4-3-6-8-6-14C4 8 4 5 6 4z" fill="#7a2338" />
        <path d="M2 40c10 4 22 4 36-2" stroke="#d6a24a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M31 6c2-3 6-1 5 2-1 2-3 3-5 4-2-1-4-2-5-4-1-3 3-5 5-2z" fill="#d6243b" />
      </svg>
      <span className="leading-none">
        <span className="block text-2xl font-extrabold tracking-wide text-ink">PANIK</span>
        <span className="mt-0.5 block text-[11px] font-bold text-ink" dir="rtl">
          {SITE_TAGLINE}
        </span>
      </span>
    </Link>
  )
}
