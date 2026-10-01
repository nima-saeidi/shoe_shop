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
    background_color: '#fbf1ee',
    theme_color: '#c9737f',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
