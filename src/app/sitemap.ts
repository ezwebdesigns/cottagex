import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';
import { db } from '@/lib/db';
import { articles, pages } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

const BASE_URL = 'https://chaletexpress.com';

const provinces = [
  'ontario', 'quebec', 'british-columbia', 'nova-scotia',
  'alberta', 'new-brunswick', 'prince-edward-island',
  'saskatchewan', 'manitoba',
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/about', '/contact', '/guides', '/p/terms'];
  const entries: MetadataRoute.Sitemap = [];

  let dbArticles: { slug: string; updatedAt: Date | null }[] = [];
  try {
    dbArticles = await db
      .select({ slug: articles.slug, updatedAt: articles.updatedAt })
      .from(articles)
      .where(eq(articles.isPublished, true));
  } catch {}

  let dbPages: { slug: string; updatedAt: Date | null }[] = [];
  try {
    dbPages = await db
      .select({ slug: pages.slug, updatedAt: pages.updatedAt })
      .from(pages)
      .where(eq(pages.isPublished, true));
  } catch {}

  for (const locale of locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : 0.8,
      });
    }

    for (const province of provinces) {
      entries.push({
        url: `${BASE_URL}/${locale}/cottage-country/${province}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }

    for (const article of dbArticles) {
      entries.push({
        url: `${BASE_URL}/${locale}/guides/${article.slug}`,
        lastModified: article.updatedAt || new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    for (const page of dbPages) {
      entries.push({
        url: `${BASE_URL}/${locale}/p/${page.slug}`,
        lastModified: page.updatedAt || new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
