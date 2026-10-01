# Storefront (Next.js)

Public shop for Panik — Persian/RTL, SEO-first, talking to the FastAPI backend with axios.

## Run

```bash
cp .env.example .env.local     # API_ORIGIN, NEXT_PUBLIC_SITE_URL
npm install
npm run dev                    # http://localhost:3000  (backend must run on API_ORIGIN)
npm run build && npm start     # production
```

## Architecture

- `src/app` — App Router routes. Catalog pages (`/`, `/products`, `/products/[slug]`, `/about`, `/contact`) are
  **server-rendered with ISR** (`revalidate`), with per-page metadata, canonical URLs, Open Graph, JSON-LD
  (`Organization`, `Product`), `sitemap.xml` and `robots.txt`.
- `/cart`, `/checkout`, `/login`, `/register`, `/account/*` (dashboard, orders, addresses, wallet, profile) are
  client-side, behind `AuthGuard`, and marked `noindex`.
- `src/lib/server-http.ts` — axios for Server Components (direct to FastAPI).
  `src/lib/http.ts` — browser axios (`/api/v1`, proxied by `next.config.ts` rewrites → no CORS), with proactive
  + single-flight JWT refresh.
- `src/store` — zustand: persisted auth tokens/user, cart mirror (header badge).
- Styling: Tailwind v4 theme tokens in `globals.css`; font Vazirmatn is bundled locally (no Google Fonts request).

## SEO checklist (implemented)

- Unique `<title>` / description / canonical per page; Persian slugs are percent-encoded consistently.
- Indexable landing pages: `/category/[slug]` (+ product pages). Filtered/sorted/search listings are `noindex`
  and disallowed in `robots.txt`; paginated pages self-canonicalise.
- Structured data: `Organization`, `WebSite` + sitelinks `SearchAction`, `Product` (+`Offer`, and `AggregateRating`/`Review`
  only when real approved reviews exist), `BreadcrumbList`, `ItemList`, `AboutPage`, `ContactPage`.
- `sitemap.xml` (home, categories, every product), `robots.txt`, web manifest, SVG icon, generated Open Graph image.
- Server-rendered + ISR HTML, `next/image` (AVIF/WebP, sizes/priority), self-hosted font, `lang="fa" dir="rtl"`.

After deploying: add the domain in **Google Search Console** (set `GOOGLE_SITE_VERIFICATION` for the HTML-tag method),
submit `https://YOUR-DOMAIN/sitemap.xml`, and use the Rich Results Test on a product URL.
