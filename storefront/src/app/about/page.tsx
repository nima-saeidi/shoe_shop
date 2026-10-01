import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'درباره ما',
  description: 'پانیک، تولیدی کفش تبریز؛ داستان ما، ارزش‌ها و تعهد ما به کیفیت و زیبایی.',
  alternates: { canonical: '/about' },
}

const VALUES = [
  { title: 'کیفیت اصیل', text: 'از انتخاب چرم و مواد اولیه تا دوخت نهایی، هر جفت کفش زیر نظر استادکاران باتجربه تبریزی تولید می‌شود.' },
  { title: 'طراحی مدرن', text: 'مدل‌های ما همگام با روز دنیا و متناسب با سلیقه بانوی ایرانی طراحی می‌شوند.' },
  { title: 'قیمت منصفانه', text: 'با فروش مستقیم از تولیدی، واسطه‌ها حذف می‌شوند و بهترین قیمت به شما می‌رسد.' },
  { title: 'پشتیبانی همراه', text: 'تعویض و مرجوعی آسان و پاسخ‌گویی سریع، بخشی از تجربهٔ خرید شماست.' },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="card bg-gradient-to-l from-[#efe4e8] to-white p-8 text-center">
        <h1 className="text-3xl font-extrabold">درباره پانیک</h1>
        <p className="mt-3 text-ink/80">تولیدی کفش تبریز؛ زیبایی در هر قدم</p>
      </header>

      <section className="card space-y-4 p-6 leading-8">
        <p>
          پانیک یک تولیدی کفش زنانه در شهر تبریز، پایتخت کفش ایران است. ما سال‌ها تجربهٔ تولید کفش پاشنه‌دار، بوت، صندل و
          کتانی را با دانش روز طراحی ترکیب کرده‌ایم تا کفشی بسازیم که هم زیبا باشد، هم راحت.
        </p>
        <p>
          هدف ما این است که خرید کفش باکیفیت، ساده و لذت‌بخش باشد؛ از انتخاب مدل تا رسیدن بسته به درب منزل شما.
        </p>
      </section>

      <section aria-labelledby="values">
        <h2 id="values" className="mb-4 text-xl font-bold">ارزش‌های ما</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((v) => (
            <li key={v.title} className="card p-5">
              <h3 className="font-semibold text-brand-dark">{v.title}</h3>
              <p className="mt-2 text-sm leading-7 text-ink/80">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <JsonLd
        data={[
          { '@context': 'https://schema.org', '@type': 'AboutPage', url: absoluteUrl('/about'), name: 'درباره پانیک', inLanguage: 'fa-IR' },
          breadcrumbJsonLd([{ name: 'خانه', path: '/' }, { name: 'درباره ما', path: '/about' }]),
        ]}
      />
      <div className="text-center">
        <Link href="/products" className="btn btn-primary px-8 py-3">مشاهده محصولات</Link>
      </div>
    </div>
  )
}
