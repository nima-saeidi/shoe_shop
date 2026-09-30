# Shoe Shop — Admin Panel (React)

A standalone, professional admin panel for the Shoe Shop backend, built as a proper
engineered SPA — a modern alternative to the server-rendered Jinja2 admin panel at
`/admin` (which still exists and keeps working; this is a second, independent way to
manage the same backend).

## Stack

| Concern | Choice | Why |
|---|---|---|
| Build tool | **Vite** | Fast dev server + optimized production builds |
| Language | **TypeScript** | Type-safe API layer, fewer runtime surprises |
| UI kit | **Ant Design** | Enterprise-grade components (Table, Form, Layout) suited to admin panels |
| Server state | **TanStack React Query** | Caching, refetching, loading/error states — no manual `useEffect` fetching |
| Client state | **Zustand** | Minimal global state (just auth), persisted to `localStorage` |
| HTTP | **Axios** | Instance with interceptors for JWT attachment + silent token refresh |
| Routing | **React Router v6** | Protected routes, nested layout |

## Architecture

```
src/
  api/          # One typed module per backend domain (products.ts, orders.ts, ...).
                # Every function returns a typed Promise — this is the ONLY place
                # that knows about HTTP/axios; pages never call axios directly.
  types/        # TypeScript interfaces mirroring the backend's Pydantic schemas.
  store/        # Zustand: authStore (tokens + current user, persisted).
  layout/       # AdminLayout: sidebar + header shell (Ant Design Layout/Menu).
  routes/       # ProtectedRoute (redirects to /login if not authenticated/admin).
  pages/        # One folder per feature — list/detail/form pages, using React Query
                # hooks (useQuery/useMutation) directly against the api/ layer.
  components/   # Small shared UI pieces (StatusTag, Money, PageHeader).
  utils/        # Formatting (toman, dates) and Persian enum label maps.
```

Data flow for any page: `page component → useQuery/useMutation → api/<domain>.ts → axios (api/client.ts) → FastAPI`.
The axios instance auto-attaches the JWT and transparently refreshes it once on a 401
before retrying the original request; if refresh also fails, it logs out and redirects
to `/login`.

## Authentication

This app logs in through the **same JWT endpoints as the public API**
(`POST /api/v1/auth/login`), then verifies the returned user has `role` of `admin` or
`superadmin` before granting access — a non-admin account is rejected client-side (and
every admin-only backend endpoint re-checks this server-side regardless, so this is a
UX guard, not the security boundary). This is independent from the Jinja2 admin panel's
session cookie and from the customer account panel's session cookie — three separate
auth mechanisms, three separate logins.

## Backend requirements

Most of this panel consumes JSON endpoints under `/api/v1/...` that already existed for
other purposes, plus a handful added specifically for this panel (all under
`/api/v1/admin/...`, hidden from the public Swagger docs since they're not part of the
customer-facing API):

- `GET /admin/dashboard` — the stats cards + recent orders table
- `GET /admin/reports` — sales/top-products/top-sizes/revenue-split/low-stock
- `GET /admin/logs`, `/admin/logs/categories`, `/admin/logs/system` — the activity log viewer
- `GET /admin/settings` — SMS/payment gateway configuration status
- `GET /admin/users`, `PUT /admin/users/{id}` — user management
- `GET /admin/products` — product list including inactive ones (the public list only shows active)
- `GET /admin/orders/{id}` — fetch any order by id (the customer-facing one is ownership-restricted)
- `GET /admin/tickets/{id}` — fetch any customer's ticket by id (same reasoning)
- `GET /admin/reviews`, `PUT /admin/reviews/{id}` — review moderation list
- `GET /wallet/users/search`, `GET /wallet/users/{id}` — admin wallet lookup by customer

## Setup

```bash
npm install
cp .env.example .env   # points VITE_API_BASE_URL at /api/v1 by default
npm run dev            # http://localhost:5173 — Vite proxies /api to localhost:8000
```

The backend must be running on `localhost:8000` (see the main project's `README.md`).
In production, either serve this app's build output behind the same reverse proxy as
the backend (keep `VITE_API_BASE_URL=/api/v1`), or point it at the full backend URL.

```bash
npm run build   # tsc type-check + production build to dist/
npm run preview # serve the production build locally
```
