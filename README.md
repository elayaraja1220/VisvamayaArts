# Vismayam Arts — website frontend

Online shop for temple-art sculptures at **https://vismayamarts.in**.

This repository is the **frontend only**: a Next.js 16 app exported as a
**static website** (HTML/CSS/JS) and uploaded to Hostinger. All data — products,
categories, appreciations, orders, enquiries — comes from a separate
**PHP (CodeIgniter) backend** that lives only on the server.

---

## 1. Architecture

```
                 Hostinger — Single Web Hosting (no Node.js)
 ┌────────────────────────────────────────────────────────────────┐
 │ public_html/                                                   │
 │ ├── index.html, _next/, products/ …   ← this project's build   │
 │ ├── .htaccess                         ← product URL routing    │
 │ └── admin/                            ← PHP CodeIgniter app    │
 │      ├── home/…            admin panel (add/edit products)     │
 │      └── vismayam_service/ JSON API used by this website       │
 │                                  │                             │
 │                              MySQL database                    │
 └────────────────────────────────────────────────────────────────┘
        ▲ static files                    ▲ API calls (fetch)
        └──────── visitor's browser ──────┘
```

- **No server-side Next.js.** The Hostinger plan cannot run Node.js, so
  `next.config.ts` uses `output: "export"`. Do not add features that need a
  Next.js server (route handlers, server actions, ISR, middleware/proxy,
  `cookies()`/`headers()`); they will fail the export.
- **Everything is fully live.** The build makes **no API calls**. Every page
  loads its data in the browser from the PHP API, so products added or edited
  in the admin appear immediately — **you only rebuild when the code changes.**
- **Backend:** `https://vismayamarts.in/admin/` (CodeIgniter, PHP 8.3).
  Admin panel URLs look like `/admin/home/viewAllProducts`; the API is
  `/admin/vismayam_service/<method>`. Its source is in
  `public_html/admin/application/controllers/` on the server, not here.

### How product pages work
There is **one** product page in the build: `out/products/__fallback/index.html`.

1. A visitor opens `/products/murugan/` (no such folder exists).
2. `public/.htaccess` (copied into `out/`) rewrites every `/products/<slug>/`
   URL — except `collections` and `__fallback` — to that page.
3. `ProductBySlug.tsx` loads the full product list, works out which product
   owns that slug, and renders `ProductDetailsClient` for its id.

Slugs are built in one place, `app/service/productLinks.ts`, using
`buildSlugMap()` (`app/utils/slugify.ts`) over all products **oldest first**:
the first product with a name gets `murugan`, later ones with the same name get
`murugan-<id>`. Product cards (`Prodcuts.tsx`) and the cart (`viewCart.tsx`)
use the same function, so links always match. Product links are plain `<a>`
tags on purpose — the page is served by `.htaccess`, so a full page load is
needed (Next.js `<Link>` would try to prefetch files that don't exist).

> If `.htaccess` is missing on the server, **every product page returns 404.**

---

## 2. Requirements

- Node.js **20.9+** (developed with Node 22) and npm
- Python 3.9+ only if you use the optional FTP deploy script

## 3. Setup

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:3000
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | PHP API base URL |
| `NEXT_PUBLIC_API_PUBLIC_PRODUCT_IMAGE_BASE_URL` | Product images uploaded in the admin |
| `NEXT_PUBLIC_API_APPRECTION_IMAGE_BASE_URL` | Appreciation images (name is misspelled in code — keep it) |

These are public URLs and are baked into the JavaScript at build time —
**rebuild after changing them.** The API sends `Access-Control-Allow-Origin: *`,
so `npm run dev` on localhost talks to the live API directly (be careful:
checkout on localhost places **real orders**).

| Script | What it does |
|---|---|
| `npm run dev` | Dev server (webpack) |
| `npm run build` | Static export to `out/` |
| `npm run lint` | ESLint |

> **Next.js 16 note:** APIs and conventions differ from older versions. Read
> the bundled docs in `node_modules/next/dist/docs/` before relying on
> remembered behaviour (see `AGENTS.md`).

---

## 4. Project structure

```
app/
├── layout.tsx                 Root layout: Toast + Cart providers, header, footer
├── globals.css
├── (pages)/                   All routes
│   ├── page.tsx               Home
│   ├── home/homeProductSections.tsx   New arrivals / collections / themes (live)
│   ├── products/
│   │   ├── [slug]/page.tsx    Builds the single __fallback product page
│   │   ├── [slug]/ProductBySlug.tsx   URL → product id (live)
│   │   ├── [slug]/ProductDetailsClient.tsx  Product details (live)
│   │   └── collections/       Collections page (live, ?category=<id>)
│   ├── checkout/              Address book (localStorage) + order submit
│   ├── about/ appreciation/ contact/ policies/ (?type=shipping|terms|privacy)
│   └── newArrivals/           Placeholder page (not linked anywhere)
├── components/                UI components (one folder each, own CSS)
├── context/cartContext.tsx    Cart state, saved in localStorage
├── service/
│   ├── dataService.ts         All API calls (GET + form-encoded POST)
│   ├── productLinks.ts        Product list cache + slug/URL helpers
│   ├── checkoutService.ts     submitOrder used by checkout
│   ├── imageSerive.ts         Product image URL helper
│   └── recentlyViewedService.ts
├── utils/                     slugify, GST calculation, breakpoints, …
└── data/                      Static JSON: nav menus, about, policies, social links
public/
├── .htaccess                  Server routing — REQUIRED (see above)
└── images/                    Site images (banners, icons, brand)
scripts/deploy-ftp.py          Optional backup + deploy helper
```

### API endpoints used (`dataService.ts`)
GET: `getAllProducts`, `getNewArrivals`, `getProductCategories`,
`getAppreciations` · POST (form-encoded): `getProductById`,
`getProductsByCategory`, `submitOrder` (fields `order`, `order_products` as
JSON strings), `sendBulkOrderEnquiry` (`enquiry`). POST endpoints answer `1`
(success) or `0` (failure).

---

## 5. Deployment (Hostinger)

1. `npm run build` → creates `out/`.
2. **Back up** `public_html` first (hPanel → File Manager, or
   `python scripts/deploy-ftp.py backup`).
3. Upload the **contents** of `out/` into `public_html`, overwriting files —
   **except** the items below.
4. hPanel → **Performance → CDN → Purge all** (the site is behind Hostinger's CDN).
5. Test: home, `/products/collections/`, any product, `/products/x-not-real/`
   (should show "Product Not Found", not Hostinger's 404), checkout.

### Never overwrite or delete on the server

| Path in `public_html` | Why |
|---|---|
| `admin/` | The PHP backend + API + product images |
| `index.html` | Currently a deliberate **"Under Construction"** page. The build's own `index.html` (real home page) must be skipped until the owner decides to launch |
| `index-demo.html` | Preview of the real home page (older build) |
| `atheenam/`, `images-uc/`, `Archive.zip` | Owner's files, unrelated to this build |
| `.htaccess` | Comes from `public/.htaccess`; if you edit it on the server, copy the change back here |

**Going live:** when the owner approves, upload the build's `index.html` too
(this replaces the Under Construction page).

### Upload options
- **hPanel File Manager:** zip the contents of `out/` (include the hidden
  `.htaccess`; leave out `index.html`), upload to `public_html`, Extract, delete the zip.
- **FTP script:** create an FTP account in hPanel → Files → FTP Accounts with
  directory `public_html`. Username format is `u306782036.<name>`. Then:
  ```bash
  # PowerShell: $env:FTP_USER="u306782036.deploy"; $env:FTP_PASSWORD="..."
  export FTP_USER=u306782036.deploy FTP_PASSWORD='...'
  python scripts/deploy-ftp.py upload --dry   # review
  python scripts/deploy-ftp.py upload         # backs up, then uploads (skips index.html, admin/)
  ```
  Hostinger's FTPS certificate is for `*.hstgr.io`; the script connects to the
  FTP IP and verifies against `ftp.hstgr.io`, so certificate checking stays on.
  Hostinger drops FTP connections often — the script retries automatically.
  Never commit FTP credentials.

---

## 6. Known issues / to-do

- **GST calculation** (`app/utils/gstcalculation.ts`): treats prices as
  GST-inclusive but takes 9% + 9% *of the inclusive total* (subtotal =
  total × 0.82). Backing GST out of an inclusive price is normally
  total ÷ 1.18. Confirm with the owner/accountant before changing — order
  amounts sent to the backend depend on it.
- **Two `submitOrder` implementations:** checkout uses `checkoutService.ts`;
  the one in `dataService.ts` is unused. The checkoutService version doesn't
  strip quotes from the API reply (a `"1"` response would be treated as an error).
- **Missing images** referenced in code: `/images/about/about-sculptures.png`
  (`app/data/about-us.json`) and `/images/placeholder.png` (`dataService.ts`
  fallback for appreciations).
- **Same page title everywhere** ("Vismayam Arts"); product pages can't have
  per-product titles/share previews in a static export without baking product
  data into the build.
- `npm run lint` reports 2 pre-existing `react-hooks/set-state-in-effect`
  errors (`Prodcuts.tsx`, `collectionsCollect.tsx`) and some warnings; they
  don't affect the build.
- `app/(pages)/newArrivals/` is an unfinished placeholder; the home page
  links to `/products/collections/?category=NewArrivals` instead.
- Product names should be unique in the admin; duplicates work (`-<id>`
  suffix) but give less readable URLs.
