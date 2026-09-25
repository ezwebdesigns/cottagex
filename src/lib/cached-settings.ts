import { cache } from 'react'
import { db } from '@/lib/db'
import { siteSettings, articles } from '@/db/schema'
import { resolveLibRefs } from '@/lib/resolve-lib-refs'
import { desc, eq } from 'drizzle-orm'
import { getCached, invalidateSettings } from '@/lib/cache'

const SETTINGS_TTL = 3600 // 1 hour (settings change rarely; admin saves invalidate)

async function fetchAllSettingsFromDB(locale: string): Promise<Record<string, any>> {
  try {
    const rows = await db.select().from(siteSettings)
    // Per-section locale preference with EN fallback. FR rows share the
    // same `section` key, so merge explicitly instead of last-write-wins.
    const bySection = new Map<string, { en?: any; fr?: any }>();
    for (const row of rows) {
      const entry = bySection.get(row.section) || {};
      if ((row as any).locale === 'fr') entry.fr = row.data;
      else entry.en = row.data;
      bySection.set(row.section, entry);
    }
    const merged: Record<string, any> = {};
    for (const [section, entry] of bySection) {
      merged[section] = locale === 'fr' ? (entry.fr ?? entry.en) : (entry.en ?? entry.fr);
    }
    // Single batched lib:ID resolution for the whole map (was N queries).
    return await resolveLibRefs(merged)
  } catch (e) {
    console.error('Failed to fetch settings:', e)
    return {}
  }
}

export const getAllSettings = cache(async (locale: string = 'en') => {
  return getCached(`settings:all:${locale}`, () => fetchAllSettingsFromDB(locale), SETTINGS_TTL)
});

export async function getSettingSection(section: string, locale: string = 'en'): Promise<any> {
  const all = await getAllSettings(locale)
  return all?.[section] ?? null
}

/**
 * All published articles with locale preference: for 'fr', FR sibling rows
 * win per (translation_of || id) group with EN fallback; for 'en', only EN.
 * Cached 5 min. Newest first.
 */
export async function getPublishedArticles(locale: string): Promise<any[]> {
  return getCached(`articles:list:${locale}`, async () => {
    try {
      const rows = await db.select().from(articles)
        .where(eq(articles.isPublished, true))
        .orderBy(desc(articles.createdAt));
      if (locale !== 'fr') return rows.filter((r) => r.locale !== 'fr');
      const byKey = new Map<number, any>();
      for (const r of rows) {
        const key = r.translationOf || r.id;
        const cur = byKey.get(key);
        if (!cur || (cur.locale !== 'fr' && (r as any).locale === 'fr')) byKey.set(key, r);
      }
      return [...byKey.values()];
    } catch {
      return [];
    }
  }, 3600);
}

export async function getRecentArticles(locale: string, limit = 3): Promise<any[]> {
  return getCached(`articles:recent:${locale}:${limit}`, async () => {
    try {
      const all = await getPublishedArticles(locale);
      const rows = all
        .slice()
        .sort((a, b) => {
          const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const db2 = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return db2 - da;
        })
        .slice(0, limit);
      return rows.map(a => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt || '',
        image: a.featuredImage || '',
        category: a.category || 'Articles',
        date: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-CA' : 'en-US', { year: "numeric", month: "long", day: "numeric" }) : '',
        readTime: `${Math.max(1, Math.ceil((a.content || '').split(/\s+/).length / 200))} min${locale === 'fr' ? ' lecture' : ' read'}`,
      }));
    } catch {
      return [];
    }
  }, 3600) // 1 hour TTL (admin article saves invalidate)
}

export { invalidateSettings }