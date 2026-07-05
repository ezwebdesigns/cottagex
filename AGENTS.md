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
- Build compiles successfully (runtime NEON quota errors only)

### Phase 2 ✅ — Remaining public pages redesigned to Base44
- Destination page (`LocationTemplate.tsx`) — colors migrated to `#0f51ec`/`#191e3b`
- Guides listing (`GuidesList.tsx`) — colors migrated, Base44-consistent card grid
- Article detail (`ArticleStandard.tsx`, `ArticleListicle.tsx`) — colors migrated, CTA sections updated
- Terms/About (`StandardTemplate.tsx`) — colors migrated
- Contact (`ContactForm.tsx`) — colors migrated, email updated to `socialmediacanada@gmail.com`
- Build compiles successfully (runtime NEON quota errors only)

### Phase 3 ✅ — i18n merge
- Merged missing keys from `messages/*.json` into `translations.ts` (home, admin, nav.login/signup/admin, footer.newsletter/support)
- Removed dead `messages/` directory (unused next-intl JSON files)
- Removed `src/i18n/request.ts` (unused next-intl server loader)
- Kept `src/i18n/routing.ts` (used by 3 page files for `locales` array)
- Active system: `TranslationsProvider` context (custom), used by 7+ components
- Dormant system: `next-intl@^4.12.0` installed but unused in source (safe to remove later)

### Phase 4 (Pending) — Data layer
Connect to `affiliatecottages`, `articles`, `pages` tables (blocked by NEON data transfer quota)

## Blocked
- **NEON data transfer quota exceeded** — all DB queries fail at runtime. Project ref: `tqcdlzmlulklnwdnhtwn`. Upgrade plan or reduce transfer to unblock.

## Key Context
- Supabase: `postgresql://postgres.tqcdlzmlulklnwdnhtwn:Chaletexpress123%40!@aws-1-us-east-2.pooler.supabase.com:5432/postgres`
- Vercel: project `prj_DDKFU49eV87CnzLS87CwGiB3SsfC`, team `team_VGJquS9c3L59Q2rJsQKPaM4t`
- 33 cottages seeded in `affiliatecottages` table; `affiliate_url` and `is_featured` are NULL/false
- `NODE_TLS_REJECT_UNAUTHORIZED=0` needed locally for Supabase SSL
- Base44 Vite source in `public/frontend/src/` for reference
