import type { Metadata } from 'next'

import { JsonLd } from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'ارتباط با ما',
  description: 'راه‌های ارتباط با پانیک، تولیدی کفش تبریز.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">ارتباط با ما</h1>
      <div className="card space-y-5 p-6 leading-8">
        <p>برای پیگیری سفارش، مشاوره و خرید عمده از راه‌های زیر با ما در ارتباط باشید.</p>
        <address className="space-y-2 not-italic">
          <p><span className="text-muted">آدرس: </span>تبریز، بازار کفش</p>
          <p><span className="text-muted">تلفن: </span><a href="tel:+984133000000" dir="ltr" className="text-brand-dark">۰۴۱-۳۳۰۰۰۰۰۰</a></p>
        </address>
      </div>
      <JsonLd
        data={[
          { '@context': 'https://schema.org', '@type': 'ContactPage', url: absoluteUrl('/contact'), name: 'ارتباط با ما', inLanguage: 'fa-IR' },
          breadcrumbJsonLd([{ name: 'خانه', path: '/' }, { name: 'ارتباط با ما', path: '/contact' }]),
        ]}
      />
    </div>
  )
}
