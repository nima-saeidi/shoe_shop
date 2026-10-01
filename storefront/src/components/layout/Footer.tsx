import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { SITE_NAME } from '@/lib/config'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-blush-deep bg-white/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 text-sm leading-7 text-muted">
            تولید و عرضه کفش زنانه با طراحی مدرن و کیفیت بالا؛ مستقیم از تولیدی‌های تبریز به دست شما.
          </p>
        </div>
        <nav aria-label="دسترسی سریع">
          <h2 className="mb-3 font-semibold">دسترسی سریع</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/products" className="hover:text-brand-dark">محصولات</Link></li>
            <li><Link href="/about" className="hover:text-brand-dark">درباره ما</Link></li>
            <li><Link href="/contact" className="hover:text-brand-dark">ارتباط با ما</Link></li>
            <li><Link href="/account" className="hover:text-brand-dark">پنل کاربری</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="mb-3 font-semibold">ارتباط با ما</h2>
          <address className="space-y-2 text-sm not-italic text-muted">
            <p>تبریز، بازار کفش</p>
            <p dir="ltr" className="text-right">۰۴۱-۳۳۰۰۰۰۰۰</p>
          </address>
        </div>
      </div>
      <p className="border-t border-blush-deep py-4 text-center text-xs text-muted">
        © {SITE_NAME} — تمامی حقوق محفوظ است.
      </p>
    </footer>
  )
}
