import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'پانیک | تولیدی کفش تبریز',
    short_name: 'پانیک',
    description: 'خرید آنلاین کفش زنانه از تولیدی کفش تبریز',
    start_url: '/',
    display: 'standalone',
    dir: 'rtl',
    lang: 'fa',
    background_color: '#f5f6f8',
    theme_color: '#8a2b45',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
