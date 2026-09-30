# Shoe Shop — FastAPI E-commerce Platform

A production-style shoe store built with FastAPI, PostgreSQL, and a server-rendered
(Jinja2) admin panel — following a clean three-layer architecture:

```
API / Admin routers  →  Services (business logic)  →  Repositories (data access)  →  SQLAlchemy models
```

## Features

**Storefront API (`/api/v1`)**
- JWT auth (access + refresh tokens), registration/login
- Products with categories, brands, multiple images, size/color variants & stock
- Search, filtering (category, brand, gender, price range), sorting, pagination
- Cart (add/update/remove items, stock validation)
- Checkout → Orders, with coupon codes, shipping cost rules, order history, cancellation
- Product reviews & ratings (moderated)
- Coupons (percent/fixed, min order, usage limits, validity window)
- User addresses, profile management, password change

**Admin Panel (`/admin`, server-rendered with Jinja2 + Bootstrap 5, Persian/RTL)**
- Session-based admin login (separate from the customer auth)
- Dashboard with revenue, order/user/product counts, order status breakdown
- Full CRUD: products (with image upload & variant management), categories, brands, coupons
- Wholesale request approval, wallet top-ups, manual (phone-in) order entry, returns/tickets moderation
- Order management with status/payment/tracking updates
- User management (enable/disable, role assignment)
- Review moderation (approve/reject/delete)

**Customer Account Panel (`/account`, server-rendered with Jinja2 + Bootstrap 5, Persian/RTL)**
- Its own login/register (session-based, independent of the admin session and the JWT API)
- Dashboard, profile + password change, saved addresses
- Order history, order detail, cancel, pay a pending invoice from wallet balance
- Wallet balance & transaction history
- Return requests (from a delivered order's item)
- Support ticket thread (create/reply)
- Wholesale ("عمده") upgrade request + status

**Admin Panel — React SPA (`admin-frontend/`, separate project)**
A second, independent way to manage the same backend: a proper engineered React app
(Vite + TypeScript + Ant Design + TanStack Query + Zustand + Axios) covering the same
feature set as the Jinja2 admin panel above, authenticated via the same JWT endpoints as
the public API. See `admin-frontend/README.md` for its architecture and setup — the two
admin panels are fully independent and either (or both) can be used; nothing was removed
from the Jinja2 one.

## Logging & audit trail

Two independent log surfaces, both readable from the admin panel (`/admin/logs`):

- **Activity log** (`activity_logs` table, `app/services/log_service.py`) — a structured,
  filterable audit trail of business events: logins (success/failure, with IP), registrations,
  orders (created/cancelled/status changed/paid), wallet transactions, wholesale
  requests/decisions, returns, support tickets, product/category/brand/coupon changes, and
  user role/active-status changes. Each entry records level, category, a human-readable Persian
  message, who did it (`actor`), and an optional target (e.g. `order #123`). The admin page at
  `/admin/logs` filters by category, level, free-text search, and date range.
- **Raw technical log** (`logs/app.log`, `app/core/logging_config.py`) — a rotating file capturing
  Python tracebacks and uvicorn's own logs, for debugging. Viewable (last 300 lines) at
  `/admin/logs/system`.

Security-relevant events (failed logins, rate-limit trips, password changes, role/active-status
changes) are logged at `warning` level so they stand out when filtering by level.

## Swagger / API docs (`/docs`)

Only the customer/site-facing JSON API (`/api/v1/...`) is listed in the OpenAPI schema —
registration, login, browsing products/categories/brands, cart, checkout, order history, wallet
balance, returns, tickets, wholesale request, etc. Admin-only JSON endpoints (product/category/brand
management, order status updates, coupon CRUD, wallet top-up, wholesale approval, the `/admin/...`
dashboard/reports/logs/settings/users endpoints the **React admin panel** consumes, ...) all work
normally, they're just marked `include_in_schema=False` so they don't clutter the public docs — the
Jinja2 admin panel doesn't call them at all (it talks to the service layer directly in-process), but
the separate `admin-frontend/` React app does call them, over HTTP with a JWT, exactly like any other
API client. The `/admin` and `/account` routers (Jinja2, server-rendered HTML) are excluded from the
schema too since they're not JSON.

## Architecture

```
app/
  core/          # config, db session, security (JWT/hashing), exceptions, rate limiting
  models/        # SQLAlchemy ORM models (data layer)
  schemas/       # Pydantic request/response models
  repositories/  # data-access layer (pure DB queries)
  services/      # business logic layer (validation, orchestration)
  api/v1/        # customer/site-facing REST API routers (visible in Swagger)
  admin/         # Jinja2 admin panel: routers + templates (not in Swagger)
  account/       # Jinja2 customer account panel: routers + templates (not in Swagger)
  static/        # uploaded product images, admin/account CSS/JS
alembic/         # DB migrations
scripts/         # seed_admin.py to bootstrap the first superadmin
```

## Setup (using your local PostgreSQL — no Docker needed)

This project is already configured and migrated against a local PostgreSQL server
(`postgres` user, running on `localhost:5432`) in a database called **`shoe_shop`**.

1. **Install dependencies** (a `venv/` virtual environment is already set up in this folder)
   ```bash
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **`.env`** is already created and points at:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:admin@localhost:5432/shoe_shop
   SYNC_DATABASE_URL=postgresql+psycopg2://postgres:admin@localhost:5432/shoe_shop
   ```
   Update the password/host there if your local PostgreSQL differs.

3. **Migrations are already applied.** All 13 tables exist in `shoe_shop`. To create a
   new migration after changing models:
   ```bash
   alembic revision --autogenerate -m "describe change"
   alembic upgrade head
   ```

4. **A superadmin user already exists:**
   - Email: `admin@shoeshop.com`
   - Password: `Admin@12345`

   To create another admin user:
   ```bash
   python -m scripts.seed_admin
   ```

5. **Run the app**
   ```bash
   uvicorn app.main:app --reload
   ```

- API docs: http://localhost:8000/docs
- Admin panel: http://localhost:8000/admin/login (log in with the credentials above)

### Alternative: running PostgreSQL via Docker

If you ever want an isolated DB instead of your local install, `docker-compose.yml`
is included — `docker compose up -d db` — but it is **not required**; the app is
already wired to your local PostgreSQL instance.

## Notes

- Prices are stored as `Numeric(10,2)`; adjust currency formatting in templates as needed.
- Uploaded images are stored locally under `app/static/uploads` — swap `app/services/media_service.py`
  for an S3/CDN-backed implementation for production use.

## Security

Implemented:
- **No SQL injection surface** — every query goes through SQLAlchemy's ORM/query builder with
  bound parameters; there is no raw/string-built SQL anywhere in the codebase.
- **Passwords** are hashed with bcrypt (via passlib), never stored or logged in plaintext.
- **JWT access/refresh tokens** are verified with an explicit algorithm allow-list (no `alg=none`
  confusion), and every request re-checks the user's current `is_active`/role from the database —
  disabling a user or admin takes effect immediately even on an unexpired token.
- **File uploads are content-sniffed, not trust-based.** `app/services/media_service.py` decodes
  the actual image bytes with Pillow and derives the stored file extension from the *verified*
  format — the client-supplied filename and `Content-Type` header (both trivially spoofable) are
  never used to decide what gets written to disk. Uploads are also capped at 5MB read defensively
  (not after buffering the whole body).
- **IDOR-resistant ownership checks** — accessing another user's order/address/ticket/review
  returns `404`, not `403`, so resource IDs can't be enumerated by probing who owns what.
- **Brute-force protection** on both the admin login form and the API `/auth/login` endpoint via
  an in-memory rate limiter (`app/core/rate_limit.py`, 10 attempts / 5 min per IP+email).
- **Security headers** (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`, and HSTS when `ENVIRONMENT=production`) are added to every response.
- **CORS** only echoes explicitly allow-listed origins from `BACKEND_CORS_ORIGINS` — no wildcard
  fallback (wildcard + credentials is both insecure and rejected by browsers anyway).
- **Session cookies** are `SameSite=Lax` always, and `Secure`/HTTPS-only automatically once
  `ENVIRONMENT=production`.
- **Mass-assignment is not possible** — every write goes through a specific Pydantic schema
  (`UserUpdate`, `ProductUpdate`, …), so a request body can never set fields it wasn't meant to
  (e.g. a customer's own profile update explicitly excludes `role`).

Before a real production deployment, also consider:
- **Rotate `SECRET_KEY` / `SESSION_SECRET_KEY`** — this repo ships with freshly generated random
  values in `.env`, but rotate them again for your actual deployment and never reuse dev secrets.
- **The rate limiter is in-memory and per-process.** Fine for a single `uvicorn` worker; swap for
  a Redis-backed limiter if you scale to multiple workers/replicas.
- **No CSRF token on admin forms.** Session cookies are `SameSite=Lax`, which blocks the classic
  cross-site `<form>` CSRF attack in modern browsers, but adding explicit CSRF tokens is
  recommended defense-in-depth for the admin panel specifically.
- **Add HTTPS/TLS** (terminate at a reverse proxy) before exposing this beyond localhost — none of
  the cookie/header hardening above substitutes for transport encryption.
- **Move uploads to S3/CDN** with your own bucket policy once this leaves a single server.
