import { db } from '@/lib/db';
import { siteSettings, libraryImages } from '@/db/schema';
import { eq } from 'drizzle-orm';

const BASE64_RE = /^data:image\/[a-z+.-]+;base64,[A-Za-z0-9+/=]+$/;

function isBase64Image(v: unknown): v is string {
  return typeof v === 'string' && BASE64_RE.test(v);
}

async function migrateValue(value: unknown): Promise<{ result: unknown; count: number }> {
  if (isBase64Image(value)) {
    const [existing] = await db.select({ id: libraryImages.id })
      .from(libraryImages)
      .where(eq(libraryImages.url, value))
      .limit(1);
    if (existing) return { result: `lib:${existing.id}`, count: 0 };
    const [inserted] = await db.insert(libraryImages).values({
      url: value,
      name: 'migrated',
      mimetype: value.split(';')[0].replace('data:', ''),
    }).returning({ id: libraryImages.id });
    return { result: `lib:${inserted.id}`, count: 1 };
  }
  if (Array.isArray(value)) {
    let total = 0;
    const result = await Promise.all(value.map(async (item) => {
      const { result: r, count: c } = await migrateValue(item);
      total += c;
      return r;
    }));
    return { result, count: total };
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    let total = 0;
    const result: Record<string, unknown> = {};
    for (const [key, val] of entries) {
      const { result: r, count: c } = await migrateValue(val);
      result[key] = r;
      total += c;
    }
    return { result, count: total };
  }
  return { result: value, count: 0 };
}

export async function migrateAllImages(): Promise<{ totalMigrated: number; sectionsUpdated: number }> {
  const rows = await db.select({ section: siteSettings.section, data: siteSettings.data }).from(siteSettings);
  let totalMigrated = 0;
  let sectionsUpdated = 0;

  for (const row of rows) {
    const { result, count } = await migrateValue(row.data);
    if (count > 0) {
      await db.update(siteSettings).set({ data: result }).where(eq(siteSettings.section, row.section));
      totalMigrated += count;
      sectionsUpdated++;
    }
  }

  return { totalMigrated, sectionsUpdated };
}
