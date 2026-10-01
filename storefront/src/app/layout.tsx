import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { SessionBootstrap } from '@/components/layout/SessionBootstrap'
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/config'
import { JsonLd } from '@/components/seo/JsonLd'
import './globals.css'

const vazir = localFont({
  src: './fonts/Vazirmatn.woff2',
  variable: '--font-vazir',
  display: 'swap',
  weight: '100 900',
})

const DEFAULT_TITLE = `کفش زنانه | خرید آنلاین از تولیدی کفش تبریز - ${SITE_NAME}`
const DEFAULT_DESCRIPTION =
  'خرید آنلاین کفش زنانه با طراحی مدرن و کیفیت بالا؛ کفش پاشنه‌دار، بوت، صندل و کتانی مستقیم از تولیدی کفش تبریز با ارسال به سراسر ایران.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['کفش زنانه', 'خرید کفش', 'کفش تبریز', 'تولیدی کفش', 'کفش پاشنه دار', 'بوت زنانه', 'صندل زنانه', 'کتانی زنانه'],
  authors: [{ name: SITE_NAME }],
  openGraph: { type: 'website', locale: 'fa_IR', siteName: SITE_NAME, title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, url: '/' },
  twitter: { card: 'summary_large_image', title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  formatDetection: { telephone: false },
  // Google Search Console "HTML tag" ownership verification (set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION).
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
}

export const viewport: Viewport = {
  themeColor: '#fbf1ee',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: SITE_TAGLINE,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      address: { '@type': 'PostalAddress', addressLocality: 'تبریز', addressCountry: 'IR' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'fa-IR',
      publisher: { '@id': `${SITE_URL}/#organization` },
      // Enables the Google sitelinks search box.
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/products?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ]

  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
          پرش به محتوای اصلی
        </a>
        <SessionBootstrap />
        <Header />
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
        <Footer />
        <JsonLd data={jsonLd} />
      </body>
    </html>
  )
}
