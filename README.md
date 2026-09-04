# Brand Storefront

A Next.js + Supabase e-commerce platform for a clothing brand, with a built-in
admin dashboard. Single app, no paid services required to run it.

This is **Stage 1**: project scaffold, design tokens, base UI components,
Supabase client setup, and the full database schema. Later stages add
authentication, the product catalog, cart/checkout, customer accounts, and
the admin dashboard on top of this foundation.

## ⚠️ Before your first build: add the local font files

The project uses self-hosted fonts (not fetched from Google at build
time — see the "Local fonts" note below for why). **Before running
`npm run build` for the first time**, follow the 5-minute steps in
[`fonts/README.md`](./fonts/README.md) to download and place the
required `.ttf` files. Skipping this step will fail the build with a
"Module not found" error pointing at the missing font path.

## 1. Install the project

```bash
npm install
```

## 2. Create the Supabase project

1. Go to https://supabase.com and create a free account.
2. Click **New project**. Pick any name/region, set a database password
   (save it somewhere safe), and wait ~2 minutes for provisioning.
3. In the project dashboard, go to **Project Settings → API**. Copy:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → this is `SUPABASE_SERVICE_ROLE_KEY` (keep secret)

## 3. Create the database (run migrations)

Install the Supabase CLI once, globally or via `npx`:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>   # found in Project Settings → General
npx supabase db push
```

This applies `supabase/migrations/0001_init.sql`, which creates every table,
enum, index, and Row Level Security policy described in the architecture doc.

If you'd rather not use the CLI: open the Supabase dashboard →
**SQL Editor** → paste the contents of `supabase/migrations/0001_init.sql` →
Run.

## 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the three Supabase values from step 2, plus a random string for
`ADMIN_BOOTSTRAP_SECRET` (used once, in step 6).

## 5. Regenerate database types

```bash
npx supabase gen types typescript --linked > lib/types/database.ts
```

Re-run this any time you change the schema.

## 6. Create the first admin account

1. Run the app (`npm run dev`) and register a normal account through
   `/account/register` (added in Stage 2), OR create a user directly in
   **Supabase Dashboard → Authentication → Users → Add user**.
2. In the Supabase **SQL Editor**, promote that user to admin:
   ```sql
   update profiles set role = 'admin' where id = '<the user''s UUID>';
   ```
   You can find the UUID in Authentication → Users.
3. Log in with that account — you'll now have access to `/admin`
   (admin route protection is added in Stage 2).

## 7. Add products

Once Stage 3/7 land: **Admin → Products → Add Product**. You'll enter the
product's base info, then colors/sizes, then per-variant stock (see the
example in the architecture doc — Black/S = 5, Black/M = 10, etc.), then
optional per-size measurements for the size guide.

Until then, you can insert test data directly via SQL Editor using the
tables in `0001_init.sql` (`products`, `product_variants`,
`variant_inventory`, ...).

## 8. Run locally

```bash
npm run dev
```

Visit http://localhost:3000.

## 9. Deploy

1. Push this repo to GitHub.
2. Go to https://vercel.com, **New Project**, import the repo (free Hobby
   tier is enough).
3. Add the same environment variables from `.env.local` in
   **Vercel → Project → Settings → Environment Variables**.
4. Deploy. Vercel rebuilds automatically on every push to `main`.

## 10. Backup / export the database

- **Ad hoc SQL dump:** Supabase Dashboard → Database → Backups (Free tier
  keeps a few days of automatic backups), or run:
  ```bash
  npx supabase db dump --linked -f backup.sql
  ```
- **Full ownership:** because this is plain Postgres, `pg_dump`/`pg_restore`
  against the connection string in Project Settings → Database also works,
  so you are never locked into Supabase's tooling.

## Project structure

See the architecture section of the project plan for the full folder
layout. In short: `app/` holds routes (customer storefront under the
`(shop)` group, admin dashboard under `admin/`), `components/` holds
reusable UI grouped by domain, `lib/supabase/` holds the three Supabase
client variants (browser, server, admin/service-role), and
`supabase/migrations/` holds the schema as version-controlled SQL.

## Stage 2 — authentication notes

- **Disable "Confirm email" for local testing (optional):** Supabase
  Dashboard → Authentication → Providers → Email → turn off
  "Confirm email" if you want new accounts to be able to log in
  immediately without clicking a confirmation link. Keep it **on** for
  production so people can't register with someone else's email.
- Registration (`/account/register`) and login (`/account/login`) are
  Server Actions in `lib/actions/auth.ts` — no Supabase calls happen in
  the browser, so the anon key is the only thing ever exposed client-side.
- `middleware.ts` refreshes the session on every request and redirects
  anyone who isn't `role = 'admin'` away from `/admin/*`. `app/admin/layout.tsx`
  repeats the same check server-side as a second layer, and the database's
  RLS policies (`is_admin()`) are the third — all three must independently
  agree, so a bug in any one layer alone can't expose admin data.
- To promote a user to admin, see step 6 above (`update profiles set role = 'admin' ...`).

## Stage 3 — product system notes

- **Apply the new migration:** `supabase/migrations/0002_storage.sql` creates
  the `product-images` Storage bucket and its policies (public read,
  admin-only write). Run it the same way as the first migration — either
  `npx supabase db push` or paste it into the SQL Editor.
- **Add at least one category first:** go to **Admin → Categories** before
  creating your first product (products can also be left uncategorized).
- **Creating a product:** Admin → Products → "+ إضافة منتج". Fill in the
  basic info, upload images (these go straight to Supabase Storage from
  your browser), then tap the colors and sizes you want — a variant grid
  appears automatically for every color × size combination, where you set
  the stock quantity and optionally a custom SKU or price override per
  variant. The measurements table is optional and only needed if you want
  the size guide to show exact numbers for that product.
- **Stock changes:** editing a product replaces its images/measurements
  and updates variants matched by SKU, so existing stock isn't reset to
  zero when you just fix a typo in the description. For quick day-to-day
  stock corrections without opening the full product form, use
  **Admin → Inventory**.
- Both product writes and stock writes always go through
  `lib/actions/products.ts`, which re-checks `role = 'admin'` server-side
  before touching anything — the admin UI being reachable is not itself
  proof of authorization.

## Stage 4 — customer storefront notes

- The whole customer-facing site now lives under the `(shop)` route group
  and shares one layout (`app/(shop)/layout.tsx`) with the Navbar and
  Footer — `/admin` intentionally has its own separate layout with no
  storefront chrome.
- The site is set to `dir="rtl"` / `lang="ar"` in `app/layout.tsx` since
  the UI text is Arabic; component classes use logical properties
  (`start-`, `end-`, `ms-`, `me-`) so spacing/positioning flips correctly
  if you ever add an English locale.
- **Add to Cart / Buy Now are intentionally inert for now** — they
  correctly capture the exact variant + quantity (you can see this in the
  confirmation message on the product page) but don't persist anything
  yet. Real cart state and checkout land in Stage 5, wired to the same
  `VariantSelector` output.
- The Wishlist button works end-to-end already (Stage 6 will add richer
  account pages around it, but the toggle + `/account/wishlist` list are
  functional now) — it redirects guests to login first.
- "Find My Size" gives an estimate from the product's own measurement
  table (with a small ease allowance on chest), not from generic
  height/weight charts — it needs at least a chest or shoulder
  measurement from the customer to work, and says so if neither is given.
- `app/sitemap.ts` and `app/robots.ts` are wired up already; update the
  `example.com` placeholder in both once you have a real domain.

## Stage 5 — cart, checkout & shipping notes

- **Apply two new migrations:** `0003_checkout.sql` (the `create_order`
  Postgres function — the single, atomic path every order goes through)
  and `0004_guest_order_access.sql` (lets a guest view their own
  just-placed order via its unguessable UUID). Same process as before:
  `npx supabase db push`, or paste each into the SQL Editor in order.
- **Seed at least one shipping zone before testing checkout:** go to
  **Admin → Shipping**, add a governorate + price (e.g. `Cairo` / `60`),
  and set the free-shipping threshold and default shipping price. Without
  any zone, checkout still works — it falls back to the default shipping
  price you set there.
- **The cart lives in the browser** (`localStorage`, via
  `lib/cart/CartContext.tsx`) — this is a normal, real browser API, not
  the sandboxed Artifacts environment, so it's the right tool here and
  persists a visitor's cart across page reloads and tabs.
- **Why prices are never trusted from the browser:** `placeOrderAction`
  only ever sends `variant_id` + `quantity` to the server. Everything
  else — unit price, subtotal, coupon discount, shipping cost, total — is
  recalculated from scratch inside the `create_order` Postgres function,
  which also row-locks each variant's stock (`FOR UPDATE`) before
  checking it, so two customers checking out the last unit at the same
  moment can't both succeed. If anything fails (out of stock, bad coupon,
  missing fields), the whole order rolls back — nothing is half-created.
- **Guest checkout works out of the box** — no account required. If a
  logged-in customer checks out, their `user_id` is attached automatically
  (via `auth.uid()` inside the function) so the order shows up in their
  account once Stage 6 adds the orders list.
- Coupons aren't publicly queryable (RLS keeps that table admin-only);
  `validateCouponAction` uses the service-role client specifically to
  check a single customer-supplied code, and the real discount is still
  reverified server-side at order creation — the preview can never be the
  final word on price.

## Stage 6 — customer accounts, orders & reviews notes

- **Account dashboard** (`/account`) now has real profile editing and
  links to Orders, Addresses, and Wishlist. `/account/orders` lists a
  logged-in customer's own orders (guest orders aren't listed anywhere —
  they're only reachable via their confirmation link, by design); each
  order links to `/account/orders/[id]` with a visual status tracker.
- **Addresses** (`/account/addresses`) are saved per-customer and can be
  set as default, but checkout itself doesn't pull from saved addresses
  yet — that wiring is a good candidate to revisit once you're past all
  8 stages, if you want it.
- **Reviews are gated by verified purchase**: a customer only sees the
  review form on a product page if they have an order item for that
  product with `status = 'delivered'` that they haven't already reviewed.
  Every new review is inserted with `is_approved = false` — it won't show
  publicly until an admin approves it from **Admin → Reviews**.
- Order tracking status labels (`pending → confirmed → preparing →
  shipped → delivered`, or `cancelled`/`returned`) are the same enum
  values Stage 7's admin order management will let you change — updating
  an order's status there is what moves a customer's tracker forward.

## Stage 7 — full admin dashboard notes

- **Admin → Orders**: search by order number/name/phone, filter by
  status, and open any order to change its status or payment status.
  Moving an order **into** `cancelled` or `returned` automatically adds
  its items' quantities back to `variant_inventory` — once, on that
  transition only, so toggling the status back and forth can't inflate
  stock.
- **Admin → Customers**: every registered customer with their order count
  and lifetime spend, computed from real order data (guest orders aren't
  tied to a customer record, so they don't appear here — see them in
  Admin → Orders instead).
- **Admin → Coupons**: full CRUD — percentage or fixed discounts, minimum
  order amount, usage limit, expiry date, and an active/inactive toggle.
  These are the exact same coupons customers apply at checkout in Stage 5;
  nothing else needs to change for a new coupon to work.
- **Admin overview** now shows real numbers: total sales, total orders,
  total customers, total active products, pending orders, and a low-stock
  list (any variant at or under its `low_stock_threshold`), plus the 5
  most recent orders and the 5 best-selling products by units sold —
  all computed live from the database, no mock data.

## Stage 8 — SEO, performance, security, testing & deployment

This is the final stage. The project is now feature-complete across all
8 stages. What changed here, plus a checklist for going live:

- **Missing content pages added:** About, Contact, Size Guide, Shipping
  Policy, Return Policy, Privacy, Terms — these were linked from the
  footer since Stage 4 but the pages themselves didn't exist yet. Edit
  the placeholder copy in `app/(shop)/pages/*/page.tsx` to match your
  actual policies before launch — the shipping/return/privacy/terms text
  is generic boilerplate, not legal advice.
- **SEO:** every page now has a title (via the root `template` in
  `app/layout.tsx` plus per-page `metadata`/`generateMetadata`), the
  product page emits `Product` structured data (JSON-LD) with price and
  rating, and `sitemap.ts`/`robots.ts` are dynamic. **Update the
  `https://example.com` placeholder** in both files, plus
  `metadataBase` in `app/layout.tsx`, once you have a real domain.
- **Performance:** product images (`ProductCard`, `ProductGallery`, home
  page category tiles) now use `next/image` instead of plain `<img>`,
  which gives automatic resizing, lazy-loading, and modern formats
  (WebP/AVIF) for free — this was the single biggest real performance win
  available at this stage. Admin-only images (product form uploader,
  cart drawer thumbnails) were left as plain `<img>` since they're
  behind auth/interaction, not part of what search engines or first-time
  visitors load.
- **Security headers** (`next.config.js`): `X-Content-Type-Options`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, and a restrictive
  `Permissions-Policy` are now sent on every response. A strict
  Content-Security-Policy was deliberately left out — a CSP tight enough
  to matter is also easy to misconfigure and silently break Next.js
  hydration or a future third-party script; add one deliberately, tested
  page-by-page, rather than shipped untested here.
- **Testing:** `npm test` runs Vitest against the two pieces of pure
  business logic most worth protecting from regressions — price
  formatting and the Find My Size recommendation algorithm (now
  extracted into `lib/utils/sizeRecommendation.ts` specifically so it's
  testable outside a browser). This isn't full coverage of the app;
  it's a starting point. The parts of the app most likely to lose money
  if broken — stock validation, pricing, coupon math — live inside the
  `create_order` Postgres function from Stage 5 and are exercised for
  real every time you place a test order, which is why the setup steps
  below include placing one before going live.

### Go-live checklist

1. Re-enable **Confirm email** in Supabase Authentication → Providers
   (Stage 2 notes) — it was turned off only for local testing.
2. Replace every `example.com` reference (`app/sitemap.ts`,
   `app/robots.ts`, `metadataBase` in `app/layout.tsx`) with your real
   domain.
3. Fill in the real contact details in
   `app/(shop)/pages/contact/page.tsx` and finish editing the policy
   pages.
4. Double-check every environment variable in Vercel matches
   `.env.local` — especially that `SUPABASE_SERVICE_ROLE_KEY` is set as
   a server-only variable, never exposed with a `NEXT_PUBLIC_` prefix.
5. In Supabase, confirm all four migrations
   (`0001`–`0004`) have been applied to your **production** project, not
   just a local/dev one, if they're different.
6. Add your real shipping zones, at least one product, and a coupon if
   you plan to launch with one.
7. Place one full real test order end-to-end (guest checkout, then a
   logged-in checkout) and confirm: stock decremented correctly, the
   order appears in Admin → Orders, and status changes reflect in the
   customer's `/account/orders/[id]` tracker.
8. Run `npm run build` locally once before deploying — it catches type
   errors `next dev` sometimes doesn't.
9. `npm audit` and address anything above "high" severity in
   dependencies that ship to the browser (dev-only tooling like `eslint`
   is lower priority — see the Stage 2 notes on this).

## Post-launch fixes

- **Storage cleanup (fixed):** removing an image — whether by deleting it
  in the product form before saving, or by replacing a product's images
  on edit, or by deleting a product outright — now also deletes the
  actual file from the `product-images` Storage bucket, not just the
  database row. Before this fix, removed images stayed in Storage forever
  as orphaned files slowly eating into the free tier's 1GB limit.
- **Product visibility:** only products with `status = 'active'` ever
  appear on the public storefront (`/shop`, category pages, search,
  homepage sections) — this is intentional, not a bug, so a newly
  created product with status "draft" won't show up until you publish
  it. Admin → Products now shows a one-click "نشر الآن" (publish now)
  button on any non-active product, and the product form itself
  color-codes the status hint so it's hard to miss.

## Bilingual site (Arabic / English)

- **Apply the new migration:** `supabase/migrations/0005_i18n_content.sql`
  adds optional English columns (`name_en`, `description_en`,
  `material_en`, `care_instructions_en`) to products, and `name_en` to
  categories, colors, and sizes. Same process as before — `npx supabase
  db push` or paste it into the SQL Editor. Nothing is required to be
  filled in; every existing product keeps working in Arabic exactly as
  before until you add a translation.
- **How the switch works:** a language button in the navbar (shows "EN"
  in Arabic mode, "AR" in English mode) sets a `NEXT_LOCALE` cookie and
  reloads the page. The root layout reads that cookie server-side and
  sets `<html lang>` / `dir="rtl"|"ltr"` accordingly, so direction and
  language are always in sync — there's no separate `/en` URL structure,
  the whole site simply renders in the chosen language.
- **Two real typeface pairings, not a fallback font:** Arabic keeps the
  Amiri + IBM Plex Sans Arabic pairing from before; English switches to
  Fraunces (display) + Work Sans (body) — a similarly warm-serif +
  clean-grotesk pairing, so the English site doesn't look like an
  afterthought.
- **Translating a product:** open it in **Admin → Products → Edit** —
  every Arabic field (name, description, material, care instructions)
  now has an optional English field right next to it. Leave any of them
  blank and that field falls back to the Arabic text automatically when
  a visitor is in English mode, so a partially-translated catalog never
  shows blank text.
- **Colors and sizes** can also get an English name — either from the
  color/size quick-add fields inside the product form, or when creating
  a category in **Admin → Categories**.
- **What's intentionally NOT translated:** the admin dashboard itself
  stays Arabic-only (it's an internal tool for you, not customer-facing),
  and customer reviews display exactly as written — auto-translating
  someone's real words would misrepresent what they actually said.

## Post-launch fixes (round 2)

- **Checkout failing on almost every order (fixed — critical):** the
  `create_order` function had a PL/pgSQL bug where a coupon-related
  variable was only initialized when a coupon code was provided. Since
  most orders don't use one, referencing that variable later in the
  function raised an error on nearly every checkout. **Run
  `supabase/migrations/0006_fix_checkout_coupon_bug.sql`** to replace the
  function with a corrected version — same logic, but the coupon fields
  are now plain variables that are safely `NULL` when no coupon is used.
  This requires no changes to any other table or existing data.
- **Failed/abandoned cart items piling up:** this was mostly a symptom of
  the bug above — every failed checkout attempt understandably left the
  cart untouched (so you didn't lose your selection), and repeated
  attempts made the cart counter climb. Fixed by fixing checkout itself.
- **Cart carrying over between different accounts (fixed):** the cart is
  now scoped per signed-in user (or "guest" when logged out) instead of
  being one shared cart for the whole browser, so switching accounts on
  the same device shows that account's own cart, not the previous one's.
- **Saved addresses not autofilling at checkout (fixed):** if a logged-in
  customer has saved addresses, checkout now shows a "use a saved
  address" dropdown above the address fields, pre-selects their default
  address, and fills every field automatically. Email is pre-filled from
  their account too.
- **Slow page navigation:** this is expected in `npm run dev` — every
  route is compiled on first visit rather than ahead of time, which adds
  real delay that has nothing to do with the app's actual runtime speed.
  To feel real performance, run:
  ```bash
  npm run build
  npm run start
  ```
  Two pages (`/` and `/product/[slug]`) now also opt into ISR caching
  (`export const revalidate`), which only takes effect in a production
  build/deploy — pages using search-param-based filters (`/shop`,
  `/shop/[category]`) are intentionally left out of this since Next.js
  forces those to render dynamically on every request regardless of a
  revalidate setting, so adding one there wouldn't actually help.
  Deploying to Vercel (see the Deploy section above) will also generally
  feel faster than local dev, since Supabase round-trips from a deployed
  serverless function are typically lower latency than from a home
  connection running a local dev server.

## Post-launch fixes (round 3)

- **Build failing with font timeout errors (fixed):** `next build` was
  trying to download the Amiri / IBM Plex Sans Arabic / Fraunces / Work
  Sans font files directly from `fonts.gstatic.com` at build time via
  `next/font/google`. On connections where that request is slow, blocked,
  or unreliable (firewalls, antivirus, some ISPs), the whole build fails
  with `ETIMEDOUT` errors. Switched to `next/font/local`, which uses font
  files stored inside the project itself — **the build no longer needs
  internet access for fonts at all.** This requires a one-time manual
  step: follow [`fonts/README.md`](./fonts/README.md) to download the
  four font families and drop their files into the `fonts/` folder
  before your first build. After that, builds work the same regardless
  of connection quality.

## Development additions (round 4 — polish & UX)

- **Instant loading states:** `loading.tsx` skeleton screens now exist for
  `/shop`, `/shop/[category]`, `/search`, `/product/[slug]`, `/account`,
  `/account/orders`, and `/checkout`. Next.js shows these immediately on
  navigation while the real data streams in, which meaningfully improves
  *perceived* speed even though the actual data-fetch time is unchanged.
- **Branded 404 and error pages:** replaced Next.js's default blank
  404/error screens with ones matching the site's design (`app/not-found.tsx`,
  `app/(shop)/not-found.tsx`, `app/(shop)/error.tsx`).
- **Wishlist heart now reflects real state everywhere:** previously the
  ♡/♥ icon on product cards always started unfilled even if the product
  was already saved, and only corrected itself after a click. Product
  grids and the product detail page now check the signed-in customer's
  actual wishlist server-side and render the correct state from the
  first paint.
- **Customers can cancel their own pending orders:** on
  `/account/orders/[id]`, an order still in `pending` status now shows a
  "Cancel order" button (with a confirm-again step to prevent accidental
  clicks). Cancelling restores the reserved stock automatically, using
  the same restocking logic as the admin cancellation flow, and is only
  ever allowed while the order hasn't moved past `pending` — once an
  admin confirms/starts preparing it, the customer needs to contact you
  directly instead of cancelling unilaterally mid-fulfillment.

## Development additions (round 5)

- **Apply the new migration:** `supabase/migrations/0007_newsletter.sql`
  creates a `newsletter_subscribers` table. Same process as before.
- **Newsletter signup now actually works:** the footer form previously
  submitted to nowhere. It now saves the email to the database, shows a
  confirmation message, and subscribers are visible at
  **Admin → النشرة البريدية**. Anyone can subscribe (insert their own
  email), but only admins can read the list.
- **Customers can edit saved addresses**, not just add/delete them — an
  "Edit" link on `/account/addresses` opens an inline form pre-filled
  with the existing address.
- **Order confirmation emails (optional):** if you set `RESEND_API_KEY`
  and `RESEND_FROM_EMAIL` in `.env.local` (free account at resend.com),
  customers now get an email confirming their order with the same
  details as the on-screen confirmation. Leave these blank and checkout
  works exactly as before — sending is best-effort and wrapped so a
  failed or skipped email can never break an order that already
  succeeded. No new dependency was added for this; it calls Resend's
  REST API directly with `fetch`.
- **Search now also matches product description and material**, not
  just the name — searching "cotton" or "قطن" now finds relevant
  products even if the word isn't in the product's title.

## Development additions (round 6 — features & animation)

- **Apply the new migration:** `supabase/migrations/0008_order_tracking.sql`
  adds optional `tracking_carrier`/`tracking_number`/`tracking_url`
  columns to orders.
- **Real toast notifications:** a proper animated toast system
  (`lib/toast/ToastContext.tsx`) now backs "added to cart" and
  newsletter-subscribed confirmations, replacing plain inline text.
  Persistent, actionable messages (checkout errors, coupon validation)
  intentionally stay as inline text near the relevant field rather than
  toasts — a toast that disappears in 3 seconds is wrong for something
  the customer needs to read and act on.
- **Recently viewed products:** tracked entirely client-side via
  `localStorage` (no account needed), shown on the homepage and on each
  product page (excluding the product you're currently viewing). This is
  a real, working feature — not a placeholder.
- **Shipment tracking:** Admin → an order's detail page now has a
  carrier / tracking number / tracking link form. Once filled in, the
  customer sees a "track your shipment" section (with a link, if
  provided) on their own order page.
- **Admin overview numbers count up** on load instead of appearing
  instantly — purely a polish animation, doesn't change any data.

## Luxury palette redesign (round 7 — in progress)

A full navy/ivory/champagne-gold identity swap, done at the design-token
level so it applies across every page and component automatically:

- `styles/tokens.css` / `tailwind.config.ts`: `--color-ink` is now a deep
  navy (`#0f1626`) instead of near-black, `--color-bone` a warmer ivory,
  `--color-stone`/`--color-stone-light` a muted taupe/beige pair, and
  `--color-clay` (the sparing accent color used for sale badges, hover
  underlines, etc.) is now a champagne gold (`#b3894f`) instead of rust.
  A `navy` alias was added for places that want the dark tone
  explicitly (announcement bar, and available for a future dark footer).
- **New announcement bar** above the navbar, showing the real free-shipping
  threshold pulled from your settings — not a hardcoded number.
- **Breadcrumbs** added to `/shop`, `/shop/[category]`, and the product
  page, plus a live product count on the listing pages.

**Not yet done from the full brief** (this was a very large spec —
flagging what's still open rather than silently skipping it):
category-card CTA restyle to match the new gold accent, an editorial
asymmetric homepage section, a VIP-styled newsletter section, quick-add
on product cards, a full-screen image zoom viewer, a dedicated mobile
filter drawer, and a payment-methods row in the footer. Happy to keep
going on any of these next — say which matters most to you first.

## Luxury redesign, continued (round 8)

- **Full-screen image lightbox:** clicking any product image now opens a
  full-screen viewer with keyboard arrows, swipe-to-navigate on mobile,
  click-to-zoom, and a dot indicator — matches the "zoom / full-screen
  viewer" requirement from the brief.
- **Mobile filter drawer:** `/shop` and category pages now open filters
  in a proper bottom-sheet drawer on mobile (with a "Clear all" /
  "Show results" footer), instead of an inline-expanding panel — desktop
  keeps the inline panel, since a full-screen drawer isn't needed there.
- **Editorial homepage section:** the old centered "brand story" text
  block is now an asymmetric two-column section on a navy background —
  large serif headline on one side, copy + CTA on the other — giving the
  homepage tonal rhythm instead of ivory top-to-bottom.
- **VIP newsletter section** on the homepage (distinct from the compact
  footer version): a dedicated full-width moment with its own heading
  and styled input, using the same real subscription backend as before.
- **Honest trust-indicator row in the footer**, instead of payment-logo
  icons for cards we don't actually accept — reflects what the store
  really supports (Cash on Delivery, secure checkout, 14-day returns)
  rather than implying Visa/Mastercard support that isn't there.
- Category tiles' "Shop Now" label and the announcement bar now use the
  new champagne-gold accent consistently.

**Still open from the original brief:** quick-add directly from product
cards (non-trivial with the multi-variant system — would need a mini
variant picker popup, since we can't honestly "add to cart" a product
that still needs a size chosen) and a dedicated Quick View modal. Happy
to build either next if useful.

## Quick Add (round 9 — closes out the luxury brief)

- **Quick Add on product cards**, desktop only (hover-revealed, matching
  the reference pattern): a "Quick Add" bar appears at the bottom of the
  image on hover. Clicking it opens a size-picker popover for the
  product's first in-stock color and adds directly to the cart on
  selection — no page navigation needed. Out-of-stock sizes are shown
  struck-through and disabled rather than hidden, so the customer can
  still see the full size range.
- This is an honest simplification, not a shortcut: if a product has
  multiple colors, quick add always uses the first one with stock (the
  same one shown as the card's primary image) — a customer wanting a
  *different* color still needs the full product page, since faking an
  instant add before a required selection is made would be exactly the
  kind of broken interaction this project has avoided everywhere else
  (see the Stage 5 checkout notes on never trusting/faking state).
- This required widening the product list query to include each
  variant's SKU, size, price override, and image — a bit more payload
  per request, worth it for the interaction.

With this, every major item from the luxury redesign brief has been
addressed except a separate "Quick View" modal (distinct from Quick Add)
— say if that's still wanted.

## Quick View (round 10 — luxury brief fully closed out)

- **Quick View modal**, triggered by a small eye icon on hover (desktop),
  distinct from Quick Add: opens a modal with the product image, name,
  price, description, and the *full* variant selector (any color, any
  size) — everything needed to genuinely evaluate and buy a product
  without leaving the page it was opened from. A "View full details"
  link is always available for anyone who wants the complete page
  (reviews, related products, size guide, measurements).
- Description/material aren't part of the lightweight product-list
  query (kept light on purpose for grid pages), so Quick View fetches
  the full product on open and shows a brief skeleton while it loads —
  same pattern already used for Recently Viewed.
- One structural fix that came with this: `ProductCard` no longer
  wraps its *entire* contents in a single `<Link>`, since Quick View's
  "View full details" is itself a link — nesting an anchor inside
  another anchor is invalid HTML and breaks navigation unpredictably.
  The card is now a `<div>` containing the image/text `<Link>` plus the
  modal as a sibling, which behaves identically for normal clicks.

Every item from the original luxury redesign brief has now been
addressed: navy/ivory/gold palette, announcement bar, breadcrumbs,
mobile filter drawer, image lightbox, editorial section, VIP newsletter,
honest trust indicators, Quick Add, and Quick View.

## Security notes baked into this scaffold

- `lib/supabase/admin.ts` (service role, bypasses RLS) throws if it's ever
  imported into browser code, and is only meant to be called from
  server-only functions that do their own authorization check first.
- All product/order tables have Row Level Security enabled from the first
  migration — nothing is world-writable.
- Order creation intentionally has **no direct insert policy** for
  customers; orders are created by server-side code after it validates
  stock and recalculates totals itself (Stage 5), so the client can never
  submit a fabricated price or total.
