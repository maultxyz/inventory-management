# Stockroom

A simple inventory management app: track items, how many of each you have, what is running low, and every stock change along the way. Each account sees only its own inventory.

It follows the same structure as Mault: a pnpm + Turborepo workspace with a React SPA, a Hono API and shared types, on Neon for the database and auth.

## Stack

| Package | What it is |
| --- | --- |
| `packages/web` | React 19, Vite, Tailwind 4, shadcn (Base UI) primitives, TanStack Query, React Hook Form + Zod, React Router |
| `packages/server` | Hono 4, Drizzle ORM, Postgres (`pg`), Neon Auth token verification (`jose`) |
| `packages/shared` | Types, constants, Zod form schemas and stock logic used by both |

## Setup

1. Create a project at [neon.com](https://neon.com) and turn on **Auth** for it.
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL`: the connection string from **Connect**.
   - `NEON_AUTH_URL` and `VITE_NEON_AUTH_URL`: the Auth URL from **Auth > Configuration** (the same value for both).
3. Install, create the tables and start both apps:

```bash
pnpm install
pnpm --filter @inventory/server db:migrate
pnpm dev
```

The web app runs on http://localhost:5173 and the API on http://localhost:3001. Vite proxies `/api` to the API.

## Commands

```bash
pnpm dev                                       # Vite :5173 + Hono :3001
pnpm build                                     # tsup (server), tsc -b + vite build (web)
pnpm lint                                      # ESLint with jsx-a11y (web)
pnpm test                                      # node:test (server), Vitest (web)
pnpm --filter @inventory/server db:generate    # new migration after changing src/db/schema.ts
pnpm --filter @inventory/server db:migrate     # apply migrations to DATABASE_URL
```

## Container

One image runs the whole app: the API, the built web app and the database migrations.

```bash
docker build -t stockroom .
docker run -p 3001:3001 -e DATABASE_URL=... -e NEON_AUTH_URL=... stockroom
```

It needs only `DATABASE_URL` and `NEON_AUTH_URL`, applies pending migrations when it starts, and serves everything on port 3001 (`/api/public/health` is the health check).

The `Container` GitHub Action (`.github/workflows/container.yml`) lints, tests and builds that image. On pushes to `main` it publishes `ghcr.io/maultxyz/inventory-management:latest` and `:sha-<commit>`, on `vX.Y.Z` tags it publishes `:X.Y.Z` and `:X.Y`, and on pull requests it only builds.

## How it works

- **Auth:** the web app signs in through Neon Auth (`@neondatabase/neon-js`) and sends the session token as a bearer token. The API verifies it against the Neon Auth JWKS and scopes every query to the token's user id.
- **Items:** name, location, quantity, reorder level, lot price and units per lot (unit cost is the lot price divided by the units per lot), an optional purchase link for reordering, tags (for example where you buy the part), and notes. An item is low on stock at or below its reorder level. Deleting is a soft delete, so the activity log keeps its history.
- **Stock changes:** quantity is only changed through stock adjustments (received, sold, returned, damaged, count correction). Each one is written to `stock_movements` in the same transaction, and stock can never go below zero.
- **Kits:** each item can say how many of it go into one feeder, device and sorting module. A kit is 1 feeder module, 1 device module and 3 or 5 sorting modules. The overview shows how many kits and modules you can pack, plans a number of 3 and 5 module kits against stock (needed, in stock, missing), and removes the parts for whole kits or single modules in one step.
- **Bulk actions:** tick items on the Items page to adjust their stock by the same amount, add or remove tags, print their labels or delete them together. Each change applies to all of the ticked items or none.
- **Labels and scanning:** print a label for one item (its row menu) or for every item shown (Print labels on the Items page) onto 3/4 x 2 1/4 inch return address labels, 30 per Letter sheet (Avery 6870 layout). You can skip labels already used on a started sheet. Print at 100%, not Fit to page. Each label has a QR code. The Scan page reads it with the camera and opens that item's stock dialog; the iPad's own camera app opens the same thing. The camera only works on `localhost` or over HTTPS.
- **Keyboard shortcuts:** press `?` for the full list. `G` then `O`/`S`/`I`/`A` switches pages; on Items, the arrow keys pick an item, `A`, `+` or `-` opens its stock dialog, and in that dialog you type the quantity (`+`/`-` switches between adding and removing) and press Enter.
- **API:** under `/api`: `GET/POST /items`, `PUT/DELETE /items/:guid`, `POST /items/:guid/stock-adjustments`, `POST /build-unit-removals`, `GET /stock-movements`. Responses are `{ success, message, data }`.
