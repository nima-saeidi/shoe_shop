import type { NextConfig } from 'next'

const API_ORIGIN = process.env.API_ORIGIN || 'http://127.0.0.1:8000'

const nextConfig: NextConfig = {
  output: 'standalone', // minimal self-contained server for the Docker image
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  images: { formats: ['image/avif', 'image/webp'] },
  // Browser calls go to the same origin and are proxied to FastAPI: no CORS setup needed
  // and the backend address never leaks to the client.
  async rewrites() {
    return [
      { source: '/api/v1/:path*', destination: `${API_ORIGIN}/api/v1/:path*` },
      { source: '/static/:path*', destination: `${API_ORIGIN}/static/:path*` },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
        ],
      },
    ]
  },
}

export default nextConfig
