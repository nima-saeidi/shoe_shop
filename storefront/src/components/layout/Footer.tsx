import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { SITE_NAME } from '@/utils/config'

const TRUST = [
  { title: 'تولید مستقیم در تبریز', text: 'از کارگاه تا درب منزل' },
  { title: 'ارسال به سراسر ایران', text: 'با کد رهگیری سفارش' },
  { title: 'روش‌های پرداخت', text: 'پرداخت در محل یا کیف پول' },
  { title: 'مرجوعی آنلاین', text: 'ثبت درخواست از پنل کاربری' },
]

export function Footer() {
  return (
    <footer className="mt-16">
      <section aria-label="مزایای خرید" className="border-y border-line bg-white">
        <ul className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {TRUST.map((t) => (
            <li key={t.title} className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blush-deep text-brand">✓</span>
              <div>
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-xs text-muted">{t.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="bg-navy text-white/80">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="inline-block rounded-lg bg-white px-3 py-2">
              <Logo />
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
              پانیک تولیدکننده و عرضه‌کننده کفش زنانه در تبریز است. هدف ما ارائه محصولی باکیفیت، با طراحی روز و قیمت منصفانه، مستقیم از کارگاه به دست شماست.
            </p>
          </div>
          <nav aria-label="دسترسی سریع">
            <h2 className="mb-3 text-sm font-semibold text-white">دسترسی سریع</h2>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white">محصولات</Link></li>
              <li><Link href="/about" className="hover:text-white">درباره ما</Link></li>
              <li><Link href="/contact" className="hover:text-white">ارتباط با ما</Link></li>
              <li><Link href="/account" className="hover:text-white">پنل کاربری</Link></li>
              <li><Link href="/account/tickets" className="hover:text-white">پشتیبانی</Link></li>
            </ul>
          </nav>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-white">اطلاعات تماس</h2>
            <address className="space-y-2 text-sm not-italic">
              <p>تبریز، بازار کفش</p>
              <p><a href="tel:+984133000000" dir="ltr" className="hover:text-white">۰۴۱-۳۳۰۰۰۰۰۰</a></p>
            </address>
          </div>
        </div>
        <p className="border-t border-white/10 py-4 text-center text-xs text-white/60">
          © {SITE_NAME} — تمامی حقوق محفوظ است.
        </p>
      </div>
    </footer>
  )
}
