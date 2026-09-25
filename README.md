# Farley CD Inc — Website & Price Estimator

The web platform for **Farley CD Inc**, a drywall repair and interior services contractor based in Mission Viejo, CA ([drywallfcdinc.com](https://drywallfcdinc.com)).

It is one React app with two products inside it:

1. **The website.** A marketing site that presents the company's services, track record and contact details, and turns visitors into leads.
2. **The price estimator.** A guided questionnaire that turns a customer's description of their project into a priced, itemised estimate. The request is emailed straight to the Farley team. An admin dashboard lets staff change prices and questions without a code change.

---

## Vision

Quoting drywall and paint work usually means a phone call, a site visit and a wait of several days for a number. The goal of this project is to shorten that loop:

- **For customers:** answer a few questions about the job and get an itemised estimate in a few minutes, with no call and no wait.
- **For the Farley team:** get structured, complete leads in the inbox, with measurements, photos, colour choices and a calculated total, instead of vague contact-form messages.
- **For the business:** keep pricing in the hands of the people who set it. Rates, material prices, question wording and even new questions are edited from `/admin` and go live immediately.

### Where it stands today

| Area | Status |
|---|---|
| Website (Home, About, Services, Contact, AI chatbot) | Live |
| Estimator: Drywall and Painting | Built. Being tested at `/priceestimatordevelopment` |
| Estimator: Trim & Baseboard | Built but switched off (commented out in `questions/stepConfig.ts`) |
| Public `/priceestimator` route | Shows a *Coming Soon* page until the calculator is finalised |
| Admin dashboard | Working. Pricing rules, baseboard/casing catalogue, question copy, custom questions |

---

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19, TypeScript, React Router 7 |
| Build | Vite 8, with a custom prerender step for SEO (`scripts/prerender.js`) |
| Styling | Global CSS (`src/index.css`) plus Tailwind via CDN (in `index.html`) plus inline style tokens (`price-estimator/theme.ts`) |
| Data & auth | Supabase (Postgres + Auth) |
| Hosting | Cloudflare Workers with static assets (`wrangler.jsonc`, `worker.js`) |
| Email | Resend, called from the Worker |
| Chatbot | OpenAI, through `functions/api/chat.js` |
| Live material prices | Apify scraper (Home Depot baseboard/casing prices) |
| SEO | `react-helmet-async`, prerendered HTML, `sitemap.xml`, JSON-LD in `index.html` |

---

## Project structure

The code is split by what it does: `website/` is the public site and `price-estimator/` is the estimator. The two share nothing except the app shell.

```
.
├── index.html               HTML shell: meta tags, JSON-LD, Tailwind CDN, GTM
├── worker.js                Cloudflare Worker: POST /api/submit-estimate (sends email), serves the SPA
├── functions/api/chat.js    Chatbot proxy to OpenAI (Cloudflare Pages Function)
├── scripts/prerender.js     Renders public routes to static HTML after `vite build`
├── public/                  Images, robots.txt, sitemap.xml
├── supabase_*.sql           Table setup scripts (see "Database")
└── src/
    ├── main.tsx             Browser entry (hydrates prerendered HTML when it matches)
    ├── entry-server.tsx     SSR entry used only by the prerender script
    ├── App.tsx              Routes, layout, loads live pricing on startup
    ├── index.css            Global styles for the whole app
    │
    ├── website/             ── Client-facing marketing site
    │   ├── pages/           HomePage, AboutPage, ServicesPage, ContactPage
    │   ├── components/      Navbar, Footer, SuccessModal, FCDChatbot
    │   ├── data.tsx         Site content: stats, projects, testimonials, services
    │   └── utils.tsx        Scroll-reveal and other shared site helpers
    │
    └── price-estimator/     ── Estimator, one folder per module
        ├── questions/       What we ask: step config, drywall/paint/trim question sets,
        │                    baseboard/casing catalogue, form schema types (form.ts)
        ├── form/            The wizard UI: /priceestimator page, steps, sidebar,
        │                    FormRenderer, AreaManager, draft saving (useEstimateDraft)
        ├── paint-explorer/  Paint colour picker used inside the paint questions
        ├── calculation/     Pure pricing engine: answers → line items → total
        ├── pricing/         Price data: default rates (prices.ts), rule types,
        │                    admin rule mapper, Supabase overrides, scraped product prices
        ├── content/         Admin-editable copy: question text overrides, custom questions
        ├── results/         /estimate page: summary, print view, "Submit request"
        ├── admin/           /admin dashboard (login-protected) and its editors
        ├── theme.ts         Shared estimator style tokens
        └── supabase.ts      Supabase client
```

**Where to put new code:**
- A new marketing page or section goes in `website/`.
- A new service or question goes in `price-estimator/questions/`.
- A new price or rate goes in `price-estimator/pricing/`.
- Anything used by both halves stays in the app shell (`App.tsx`, `index.css`).

---

## How the estimator works

```
 Customer                          Browser                                   Server / services
 ────────                          ───────                                   ─────────────────
 opens estimator  ──►  App.tsx loads live price overrides ◄──────────────────  Supabase: price_overrides
                       CopyProvider loads question copy + custom questions ◄─  Supabase: question_overrides, custom_questions

 Step 1  Contact info
 Step 2  Drywall areas  ─┐  answers saved to localStorage on every change (draft survives refresh)
 Step 3  Painting areas ─┘

 Submit  ──►  form/estimateForm.ts
               ├─ builds photo thumbnails + a scope-of-work summary per area
               ├─ calculation/estimate.ts  → line items + grand total
               └─ stores result in localStorage, navigates to /estimate

 /estimate   results/EstimatePage.tsx shows itemised summary (printable)
 "Submit request"  ──►  POST /api/submit-estimate  ──►  worker.js  ──►  Resend email to the Farley team
```

**How pricing is resolved:**
1. Defaults are hard-coded in `pricing/prices.ts`.
2. On app start, admin-saved overrides from Supabase `price_overrides` are applied on top by `pricing/pricingMapper.ts`.
3. The calculation engine always reads the resulting values, so an admin price change takes effect on the next page load without a redeploy.

---

## Admin dashboard (`/admin`)

This route is protected by Supabase Auth (`admin/RequireAuth.tsx`). It has four tabs:

| Tab | What it does | Stored in |
|---|---|---|
| Pricing Rules | Edit every rate (per sq ft, per linear ft, flat fees, per gallon), bulk-adjust by % | `price_overrides` |
| Baseboard/Casing | Run the Apify scraper to refresh Home Depot product prices | `product_prices` |
| Edit Questions | Change the label, help text or placeholder of any built-in question | `question_overrides` |
| Custom Questions | Add new questions (with their own pricing rule) to any step | `custom_questions` |

---

## Routes

| Path | What | Prerendered |
|---|---|---|
| `/` | Home | yes |
| `/about` | About | yes |
| `/services` | Services | yes |
| `/contact` | Contact form | yes |
| `/priceestimator` | Public estimator (currently *Coming Soon*) | yes |
| `/priceestimatordevelopment` | Working estimator for internal testing | no |
| `/estimate` | Estimate summary / submit | no |
| `/admin/*` | Admin dashboard (login required) | no |

The navbar, footer and chatbot are hidden on the estimator and admin routes.

---

## Getting started

### Prerequisites
- Node.js 20 or newer
- A Supabase project (URL and anon key)
- Optional for local dev: Resend, OpenAI and Apify keys, if you want email, the chatbot and price scraping to work

### Install and run

```bash
npm install
npm run dev          # Vite dev server behind `wrangler pages dev` (serves functions/ too)
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev with hot reload, proxied through Wrangler |
| `npm run build` | Type-check, production build, then prerender the public routes into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | ESLint |
| `npm run dev:functions` | Build, then serve `dist/` with Pages Functions |

### Environment variables

Create a `.env` file in the project root for the `VITE_*` values. Set server secrets in the Cloudflare dashboard, or in `.dev.vars` for local Wrangler. Env files are git-ignored, so never commit them.

| Variable | Where it's used | Side |
|---|---|---|
| `VITE_SUPABASE_URL` | `price-estimator/supabase.ts` | Browser |
| `VITE_SUPABASE_ANON_KEY` | `price-estimator/supabase.ts` | Browser |
| `VITE_APIFY_TOKEN` | `pricing/apifyPrices.ts` (admin scraper) | Browser |
| `VITE_OPENAI_API_KEY` | Chatbot fallback when `/api/chat` is unavailable | Browser |
| `RESEND_API_KEY` | `worker.js`, sends estimate emails | Server |
| `OPENAI_API_KEY` | `functions/api/chat.js`, chatbot proxy | Server |

> Anything prefixed `VITE_` is compiled into the public JavaScript bundle and visible to anyone who opens the site.

---

## Database (Supabase)

| Table | Purpose | Setup script |
|---|---|---|
| `price_overrides` | Current admin pricing rules (single row `main`) | `supabase_price_overrides.sql` |
| `product_prices` | Scraped baseboard/casing price per linear ft | `supabase_product_prices.sql` |
| `question_overrides` | Edited question copy | none in repo |
| `custom_questions` | Admin-added questions | none in repo |
| `form_versions` | Pricing-rule snapshots (`pricing/pricingRules.ts`, not called by any screen yet) | none in repo |
| `rate_changes` | Rate-edit audit log (same, not called by any screen yet) | none in repo |

To set up a new environment, run the `.sql` scripts in the Supabase SQL editor. The tables marked "none in repo" were created directly in Supabase, so copy their schema from the existing project.

---

## Deployment

The site runs as a **Cloudflare Worker with static assets** (`wrangler.jsonc`):

```bash
npm run build
npx wrangler deploy
```

- `dist/` is served as the asset directory with SPA fallback, so client-side routes resolve to `index.html`.
- `worker.js` handles `POST /api/submit-estimate` and passes every other request to the static assets.
- Add `RESEND_API_KEY` to the Worker's secrets.

---

## Conventions

- **Structure by feature.** Keep each estimator module in its own folder, and don't import from `website/` into `price-estimator/` or the other way round.
- **Relative imports.** There are no path aliases.
- **Keep the pricing engine pure.** `calculation/` should only turn answers into numbers. Fetching and saving data belongs in `pricing/` and `content/`.
- **Prices are data, not code.** Defaults live in `pricing/prices.ts`. Everything the business changes regularly belongs in the admin dashboard.
- Before pushing, run `npm run build` and `npm run lint`. The build type-checks everything and fails on broken imports.
