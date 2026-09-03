import { cache } from 'react'
import { db } from '@/lib/db'
import { siteSettings, articles } from '@/db/schema'
import { resolveLibRefs } from '@/lib/resolve-lib-refs'
import { desc, eq } from 'drizzle-orm'
import { getCached, invalidateSettings } from '@/lib/cache'

const SETTINGS_TTL = 120 // 2 minutes

async function fetchAllSettingsFromDB(): Promise<Record<string, any>> {
  try {
    const rows = await db.select().from(siteSettings)
    const map: Record<string, any> = {}
    for (const row of rows) {
      map[row.section] = await resolveLibRefs(row.data)
    }
    return map
  } catch (e) {
    console.error('Failed to fetch settings:', e)
    return {}
  }
}

export const getAllSettings = cache(async () => {
  return getCached('settings:all', fetchAllSettingsFromDB, 120)
});

export async function getSettingSection(section: string, locale: string = 'en'): Promise<any> {
  const all = await getAllSettings()
  return all?.[section] ?? null
}

export async function getRecentArticles(locale: string, limit = 3): Promise<any[]> {
  return getCached(`articles:recent:${locale}:${limit}`, async () => {
    try {
      const rows = await db.select({
        slug: articles.slug,
        title: articles.title,
        excerpt: articles.excerpt,
        featuredImage: articles.featuredImage,
        category: articles.category,
        publishedAt: articles.publishedAt,
        content: articles.content,
      }).from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.publishedAt)).limit(limit);
      return rows.map(a => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt || '',
        image: a.featuredImage || '',
        category: a.category || 'Articles',
        date: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-CA' : 'en-US', { year: "numeric", month: "long", day: "numeric" }) : '',
        readTime: `${Math.max(1, Math.ceil((a.content || '').split(/\s+/).length / 200))} min`,
      }));
    } catch {
      return [];
    }
  }, 300) // 5 min TTL
}

export { invalidateSettings }