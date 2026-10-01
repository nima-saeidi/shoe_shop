export const SITE_NAME = 'پانیک'
export const SITE_TAGLINE = 'تولیدی کفش تبریز'
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
// Used only on the server (SSR / ISR) — browsers go through the /api rewrite instead.
export const API_ORIGIN = process.env.API_ORIGIN || 'http://127.0.0.1:8000'
