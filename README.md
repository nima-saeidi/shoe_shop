# Panik — Shoe Shop

A monorepo of **three independent projects** plus the Docker stack that runs them together.

| Folder | What | Stack | Own Dockerfile |
|---|---|---|---|
| `backend/` | REST API, business logic, legacy Jinja2 admin | FastAPI, PostgreSQL, SQLAlchemy, Alembic | yes |
| `admin-frontend/` | Admin panel SPA (Persian, Jalali calendar) | React, Vite, Ant Design | yes (nginx) |
| `storefront/` | Public shop: SEO, cart, checkout, customer account | Next.js, Tailwind, axios | yes (standalone) |

Each folder can be developed, built and deployed on its own (see its `README.md`). `docker-compose.yml` +
`proxy/Caddyfile` wire them together behind one reverse proxy with automatic HTTPS.

```
                 ┌────────────────────── Caddy (80/443, auto HTTPS) ──────────────────────┐
 panik.ir ──────▶│ storefront :3000 ──┐                                                    │
 admin.panik.ir ▶│ admin (nginx) :80 ─┼──▶ /api, /static ──▶ backend :8000 ──▶ PostgreSQL  │
 api.panik.ir ──▶│ backend :8000 ─────┘                                                    │
                 └─────────────────────────────────────────────────────────────────────────┘
```

The two frontends proxy `/api` and `/static` to the backend themselves, so they are same-origin with
their own domain: **no CORS configuration is needed.**

## Run everything with Docker

```bash
cp .env.example .env        # set domains + POSTGRES_PASSWORD + SECRET_KEY + SESSION_SECRET_KEY
docker compose up -d --build
docker compose exec backend python -m scripts.seed_admin     # create the first superadmin
```

Migrations run automatically when the backend container starts.

### Local test (no domains)
In `.env` use `SITE_DOMAIN=http://localhost`, `ADMIN_DOMAIN=http://admin.localhost`,
`API_DOMAIN=http://api.localhost`, `SITE_PUBLIC_URL=http://localhost`, `ENVIRONMENT=development`
(production mode sets HTTPS-only cookies). Then open http://localhost and http://admin.localhost.

### Production server + domain
1. Create DNS **A records** for the three domains (shop, admin, api) pointing at the server IP.
2. Open ports **80 and 443** in the firewall.
3. Put the real domains in `.env` (bare names, e.g. `SITE_DOMAIN=panik.ir`) and `SITE_PUBLIC_URL=https://panik.ir`.
4. `docker compose up -d --build` — Caddy obtains and renews Let's Encrypt certificates by itself.

Notes
- Changing `SITE_PUBLIC_URL` needs `docker compose build storefront` (it is baked into canonical links/sitemap).
- Data lives in named volumes: `pgdata` (database), `uploads` (product/brand images), `backend_logs`, `caddy_data` (certificates). Back up `pgdata` and `uploads`.
- The database is not published on a host port; use `docker compose exec db psql -U shoe_user shoe_shop`.
- Logs: `docker compose logs -f backend` (or `storefront`, `admin`, `proxy`).
- Update after pulling new code: `docker compose up -d --build`.

## Local development without Docker
- Backend: `backend/README.md` (port 8000)
- Admin: `cd admin-frontend && npm i && npm run dev` (port 5173, proxies `/api` to :8000)
- Storefront: `cd storefront && cp .env.example .env.local && npm i && npm run dev` (port 3000)

`docs/design/` holds the reference mock-ups the storefront theme is based on.
