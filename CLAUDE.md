# CLAUDE.md

Conventions and non-obvious invariants only. Feature details belong in the code. Keep additions to one line where possible. The structure and conventions mirror Mault (`../magic-vault`); when in doubt, do what it does.

## Commands

```bash
pnpm install
pnpm dev                                       # Vite :5173 + Hono :3001
docker build -t stockroom .                    # the single app image (API + web app)
pnpm build                                     # tsup (server), tsc -b + vite build (web)
pnpm --filter @inventory/web lint              # only package with a lint script
pnpm --filter @inventory/server test           # node:test via tsx, tests/*.test.ts
pnpm --filter @inventory/web test              # Vitest + jsdom + Testing Library
pnpm --filter @inventory/server db:generate    # migration from schema.ts changes (db:migrate to apply)
```

## Architecture

pnpm + Turborepo: `shared` (types, constants, zod schemas, stock logic; no build), `server` (Hono 4, Drizzle, Postgres), `web` (React 19 SPA). One root `.env`. Every API route is mounted under `/api` (`API_PATH_PREFIX`); the Vite proxy forwards `/api` unchanged.

- One container runs everything (`Dockerfile`): with `WEB_DIST_DIR` set the server also serves the built web app with an SPA fallback, and writes `/env.js` (`window.__ENV__`) from its own environment so the image holds no deployment config. Its command applies pending migrations (`migrate.js`, the same journal `drizzle-kit migrate` uses) before starting. The server bundle inlines every dependency (`noExternal`), so a new dependency with native or optional requires must be added to tsup `external` and installed in the runtime stage.
- `.github/workflows/container.yml` lints, tests and builds the image, and pushes `ghcr.io/<owner>/<repo>` on `main` (`:latest`, `:sha-`) and on `vX.Y.Z` tags; pull requests only build.

- Auth is Neon Auth only. Bearer tokens everywhere, never cookies. `requireAuth` verifies the token against the Neon Auth JWKS and sets `userId`.
- Data is scoped per user in the query, not by RLS: every read and write on `items` and `stock_movements` filters `user_id = c.get("userId")`.
- Route handlers don't wrap their work in try/catch: `app.onError` returns the JSON 500. Catch only to turn a specific error into a different response.
- Domain failures (not found, not enough stock) return 200 with `{ success: false, message }`; only malformed bodies return 400. A 401 signs the web client out.
- `items` is soft-deleted (`is_deleted`): every read filters it. `stock_movements` rows are permanent.
- Quantity changes only through `POST /build-unit-removals` (see Kits) and `POST /items/:guid/stock-adjustments`, which updates the item and inserts the movement in one transaction with a `quantity + change >= 0` guard in the `WHERE`; item edits never touch quantity.
- Kits: an item is a kit part when any of its `feeder_module_quantity`, `device_module_quantity` or `sorting_module_quantity` (how many go into one module of that type) is above 0. A kit is 1 feeder + 1 device + 3 or 5 sorting modules (`MODULE_COUNTS_BY_BUILD_UNIT`). All kit maths (capacity, plan, removal needs) lives in `shared/kits.ts` and is used by both the overview and `POST /build-unit-removals`, which locks the user's items, refuses the whole removal if any part is short, and writes one `packed` movement per part.
- `items.purchase_url` is validated as http or https only (shared `isHttpUrl`); the web opens it only through `purchaseUrlOf`/`openPurchaseLink`, in a new tab with `noopener noreferrer`, never by rendering the stored string into an `href` unchecked.
- Bulk actions act on the checked items that are currently shown (`useItemSelection` intersects the selection with the filtered list, so hidden rows are never touched). Stock, tag and delete changes go through `POST /items/bulk-stock-adjustments`, `/bulk-tags` and `/bulk-deletions`, each one transaction that changes every item or none; bulk label printing is client only. Item shortcuts act on the selection when there is one, otherwise on the picked row.
- Tags are free text on the item (`items.tags`, a `text[]`), not a separate table: up to `ITEM_TAGS_MAX` per item, de-duplicated ignoring case by shared `normalizeTags` in the form schema. The tag filter and the form's suggestions come from `tagsOfItems` over the loaded items; compare tags with `hasTag`, never `===`.
- Money is stored as integer cents: an item has `lot_price_cents` and `units_per_lot` (at least 1), and unit cost is never stored. Derive it with shared `unitCostCentsOf` (can be a fraction of a cent, shown with up to 4 decimals through `formatUnitCostFromCents`) and stock value with `stockValueCentsOf`, which multiplies before dividing. Forms edit prices as text and convert through `priceToCents`/`centsToPrice`.

## Web conventions

- Feature-first: `features/<name>/{api,components,lib}`; cross-feature code in top-level `components/`, `hooks/`, `lib/`. API calls through `lib/api/client.ts` from `features/*/api/`.
- Forms: React Hook Form + Zod resolver, never `useState` per field. Schemas the server also validates live in `shared`; web-only ones in `web/src/schemas`. Schema messages are `formValidationMessage(...)` keys (`validation.*` in `locales/en/common.json`), translated by `FieldError`.
- Every string goes through i18next (`locales/en/*.json`), even though English is the only locale.
- Query keys include the user id, and writes go through `useItemActions`, which invalidates items and stock movements and shows the toast.
- Types, interfaces and constants never live in component, hook or route files: `lib/interfaces/*` and `lib/constants/*`, shared ones in `shared`.
- The look is modelled on the Zed editor, not Mault: flat surfaces separated by 1 px borders, no gradients, no shadows except a faint one on popovers, 4 px radii (`--radius` and `--card-radius`), neutral grey palette (light from Zed's One Light; dark is near black, `#0a0a0c` content on `#050506` chrome, by request), IBM Plex Sans and IBM Plex Mono. The accent blue (`--primary`) is only for focus rings, links and the selected add or remove toggle.
- Shell: `bg-sidebar` chrome (32 px top bar, 208 px bordered nav, 24 px status bar) around a square, full-bleed `bg-background` main area. Cards are `rounded-card border bg-card` (same colour as the page, so the border is what frames them). Never add coloured fills, icon wells, or raised buttons: the default `Button` is a neutral grey fill, status badges are a coloured dot plus plain text, callouts are neutral with a coloured icon.
- Structure still follows Mault (primitives in `components/ui`, class conventions, compact sizes from `md` up and phone sizes below), but the tokens in `index.css` and the `button`, `badge` and `dialog` primitives are restyled here, so do not copy those back from Mault.
- Two deliberate differences for the iPad: the items and activity tables switch to card lists below `lg` (`COMPACT_LAYOUT_MAX_WIDTH_PX`) so iPad portrait does not scroll sideways, and dialogs anchor to the top on coarse pointers (`pointer-coarse:`) so the on-screen keyboard does not cover them.
- Hotkeys only through `useHotkeys`, declared in `HOTKEYS` (`lib/constants/hotkeys.ts`) with a `hotkeys.actions.*` string; the system is Mault's (`lib/hotkeys.ts`), so shortcuts are ignored while typing in a field or while a dialog is open. Every new action gets a shortcut and, where there is a button, a `HotkeyHint`. Keys that must work inside a dialog are handled in that dialog and only listed in `HOTKEYS` for the shortcuts list (the `stockDialog` group: plus and minus in the quantity field, Enter to save).
- Never bind Enter or Space as a page hotkey: they would hijack the focused button. `WholeNumberInput` selects its value on focus so typing replaces it.
- Item labels carry a QR code of `itemScanUrl()` (`<origin>/app/scan?item=<guid>`), so the iPad's own camera app opens the item too. The in-app scanner (`use-qr-scanner`, jsQR on camera frames) only reads the `item` parameter through `itemGuidFromScannedText`, never the host, so labels printed from another address keep working; changing that URL shape breaks every label already printed.
- Labels print through `LabelPrintSheet`, a portal on `body` that is hidden on screen and is the only thing shown in print (`.label-print-sheet` rules in `index.css`). There is one label stock: 3/4 x 2 1/4 inch return address labels, 30 per US Letter sheet (Avery 6870 layout). Its geometry is `LABEL_SHEET` in inches (0.625 in top and bottom margins, 0.375 in side margins, 0.5 in column gaps, 0.25 in row gaps); each printed page is a full-bleed CSS grid at those physical sizes with `@page` margin 0, so it must be printed at 100%. `labelSheetsOfPrintJob` pages the labels and leaves already-used positions blank.
- The camera needs a secure context: scanning works on `localhost` and over HTTPS only.
- Accessibility is WCAG 2.2 AA: one `h1` per routed page (`PageHeader`), accessible names on icon-only buttons, state never by color alone (status badges and quantity changes carry text), lint with `eslint-plugin-jsx-a11y` strict and no `eslint-disable`.

## Code style

- YAGNI, fail fast, simple first, delete aggressively.
- Verbose, self-documenting names. No code comments in app code; record non-obvious things here instead.
- Never use em dashes anywhere.
