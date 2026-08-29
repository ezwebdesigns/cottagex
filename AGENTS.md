<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Goal
Replace the current cottage site frontend with a new design from Base44, adapted to Next.js App Router.

## Brand & Style
- Brand: **Chalet Express** (chaletexpress.com)
- Email: socialmediacanada@gmail.com
- Colors: primary `#0f51ec`, navy `#191e3b`, accent `#77e1fb`
- Font: Radio Canada (Google Fonts)
- Layout: collapsible AppSidebar (68px→240px on hover) for public pages, hidden on admin/auth
- URL: `/cottage-country/` for province destination pages
- Tailwind v4 (`@import "tailwindcss"` + `@theme inline`)
- Lucide-react v1.16.0 — brand icons (Facebook/Instagram/Youtube) removed; use `Globe` as fallback

## Progress

### Phase 1 ✅ — Public frontend
- `src/lib/translations.ts`, `TranslationsProvider.tsx`, `useTranslations.ts`
- `src/components/cottagex/` — AppSidebar, Header, Footer, Hero, PropertyCard, PropertyGrid, CategoryBar, WeatherWidget
- `src/components/PublicLayoutWrapper.tsx` — conditionally shows sidebar layout
- `app/[locale]/layout.tsx` — TranslationsProvider + PublicLayoutWrapper
- `app/[locale]/page.tsx` — Hero + CategoryBar + PropertyGrid
- Old `components/layout/` removed (dead code)

### Phase 1.5 ✅ — Admin UI redesigned to Base44
- Admin layout sidebar — Base44 logo (Mountain icon, "Chaletx"), primary `#0f51ec`, rounded-xl nav, slate borders
- Dashboard — Base44 Overview style (stats with colored icon backgrounds, performance cards, quick action buttons)
- Cottages — Base44 table (search bar, featured/standard filter, star toggle, edit modal with photo/name/slug/links/source)
- Articles — Base44 card grid (category badges, status pills, image preview, hover shadow)
- Settings — updated all colors to Base44 palette, rounded-full buttons, slate borders
- All 12 remaining admin pages (messages, library, login, profile, pages, destinations, articles create/edit, pages create/edit, destinations create/edit) — colors migrated to Base44
- Build compiles successfully (runtime DB errors only, falls back to defaults)

### Phase 2 ✅ — Remaining public pages redesigned to Base44
- Destination page (`LocationTemplate.tsx`) — colors migrated to `#0f51ec`/`#191e3b`
- Guides listing (`GuidesList.tsx`) — colors migrated, Base44-consistent card grid
- Article detail (`ArticleStandard.tsx`, `ArticleListicle.tsx`) — colors migrated, CTA sections updated
- Terms/About (`StandardTemplate.tsx`) — colors migrated
- Contact (`ContactForm.tsx`) — colors migrated, email updated to `socialmediacanada@gmail.com`
- Build compiles successfully (runtime DB errors only, falls back to defaults)

### Phase 3 ✅ — i18n migration to next-intl (completed Aug 17 2026)
- **Active system: next-intl@^4.12.0** — `messages/en.json` + `messages/fr.json`, `createNextIntlPlugin()` in next.config.ts, `src/i18n/request.ts` (getRequestConfig, fallback `en`, manual locale validation via `locales as readonly string[]` since `hasLocale` doesn't exist in 4.12), `src/i18n/routing.ts` (exports `locales`/`defaultLocale` only, **not** `routing`)
- `src/app/[locale]/layout.tsx` — `NextIntlClientProvider` + `getMessages()`, `setRequestLocale(locale)` REQUIRED (without it requestLocale falls back to `en`), `notFound()` for invalid locales
- `src/proxy.ts` (Next.js 16 proxy convention, not middleware.ts) — auto locale detection via Accept-Language, redirects `/` → `/en|/fr`, keeps `x-locale`/`x-pathname` headers + maintenance
- 10 components + `[locale]/not-found.tsx` rewritten to `useTranslations`/`useLocale` (`t('key')`, `t.raw()` for dynamic keys, `t.has()` for optional keys)
- `src/global.d.ts` — `IntlMessages` typing from `messages/en.json`
- Deleted: `src/lib/translations.ts`, `src/lib/TranslationsProvider.tsx`, `src/lib/useTranslations.ts`, `src/proxy.js`, dead `messages/` dir, `src/i18n/request.ts` (old next-intl server loader) — rebuilt with current setup
- Admin lives under `[locale]/admin` → `/en/admin`, `/fr/admin`
- Note: next-intl peerDeps compatible with next ^16; `t.raw(key: string): any` accepts dynamic keys

### Phase 4 (Pending) — Data layer
Connect to `affiliatecottages`, `articles`, `pages` tables (migrated to NEON)

## Key Context
- NEON: `postgresql://neondb_owner:npg_Yq5DfVIswFB9@ep-morning-frog-apofbubd-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require`
- 145 cottages in `affiliatecottages` table (NEON production branch)
- `NODE_TLS_REJECT_UNAUTHORIZED=0` not needed for NEON
- Base44 Vite source in `public/frontend/src/` for reference
