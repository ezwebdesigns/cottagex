import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';
import { db } from '@/lib/db';
import { articles, pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

const BASE_URL = 'https://chaletexpress.com';

// Must match PROVINCE_SLUGS in cottage-country/[slug]/page.tsx — every
// entry here must resolve to a real route, otherwise the sitemap lists 404s.
const provinces = [
  'ontario', 'quebec', 'alberta', 'british-columbia', 'nova-scotia',
  'new-brunswick', 'manitoba', 'saskatchewan', 'pei', 'newfoundland',
];

// CMS slugs colliding with static routes or destinations — never indexed
// as standalone /{slug} pages.
const RESERVED_SLUGS = new Set([
  ...provinces, 'about', 'contact', 'guides', 'terms',
  'search', 'cottage-country', 'p', 'admin',
]);

// Major indexable search landing pages.
const SEARCH_PAGES = [
  '', 'pet-friendly', 'lakefront', 'hot-tub', 'luxury', 'family', 'mountain',
];

export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

function localized(
  path: string,
  opts: { changeFrequency: Entry['changeFrequency']; priority: number; lastModified?: Date },
): Entry[] {
  // One entry per locale with hreflang alternates. NOTE: no `new Date()`
  // here — a moving lastmod makes Google ignore it and wastes crawl budget.
  const languages: Record<string, string> = {};
  for (const locale of locales as readonly string[]) {
    languages[locale] = `${BASE_URL}/${locale}${path}`;
  }
  return (locales as readonly string[]).map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    ...(opts.lastModified ? { lastModified: opts.lastModified } : {}),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static routes (lastmod omitted: they change with deploys, not on a schedule).
  for (const route of ['', '/about', '/contact', '/guides', '/p/terms']) {
    entries.push(...localized(route, { changeFrequency: 'monthly', priority: route === '' ? 1.0 : 0.8 }));
  }

  for (const province of provinces) {
    entries.push(...localized(`/cottage-country/${province}`, { changeFrequency: 'weekly', priority: 0.9 }));
  }

  for (const searchPage of SEARCH_PAGES) {
    entries.push(...localized(`/search${searchPage ? '/' + searchPage : ''}`, { changeFrequency: 'weekly', priority: 0.7 }));
  }

  try {
    const dbArticles = await db
      .select({ slug: articles.slug, updatedAt: articles.updatedAt })
      .from(articles)
      .where(eq(articles.isPublished, true));
    for (const article of dbArticles) {
      entries.push(...localized(`/guides/${article.slug}`, {
        changeFrequency: 'monthly',
        priority: 0.7,
        lastModified: article.updatedAt || undefined,
      }));
    }
  } catch {}

  try {
    const dbPages = await db
      .select({ slug: pages.slug, updatedAt: pages.updatedAt })
      .from(pages)
      .where(eq(pages.isPublished, true));
    for (const page of dbPages) {
      if (RESERVED_SLUGS.has(page.slug)) continue;
      entries.push(...localized(`/${page.slug}`, {
        changeFrequency: 'monthly',
        priority: 0.6,
        lastModified: page.updatedAt || undefined,
      }));
    }
  } catch {}

  return entries;
}
