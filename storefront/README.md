# Storefront (Next.js)

Public shop for Panik — Persian/RTL, SEO-first, talking to the FastAPI backend with axios + TanStack React Query.

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
- Folder layout (same as the admin panel):

  ```
  src/
    app/          routes (thin page.tsx files) + providers/ (React Query) + store/ (zustand auth)
    assets/       fonts/, styles/globals.css
    components/   layout/ (header, footer, nav) and ui/ (Alert, Field, Price, ...)
    features/     <feature>/{components,hooks,pages,services,types} — auth, account, catalog, cart,
                  orders, addresses, wallet, tickets, returns
    services/     apiClient.ts (browser axios), serverClient.ts (server axios), queryClient.ts
    types/        shared types (Page<T>)
    utils/        config, format, labels, media, seo, jwt
  ```
- Data flow in the browser: `component → features/<x>/hooks (React Query) → features/<x>/services → axios`.
  `services/apiClient.ts` targets `/api/v1` (proxied by `next.config.ts` rewrites → no CORS) with proactive +
  single-flight JWT refresh. Server state (cart, orders, addresses, ...) lives only in the React Query cache;
  zustand keeps just the persisted auth tokens/user.
- Catalog reads run on the server (`features/catalog/services/catalogService.ts`, axios straight to FastAPI) so
  every catalog page is fully rendered for search engines.
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
