import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { siteSettings } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';
import { invalidateSettings } from '@/lib/cache';
import { translateSettingsData } from '@/lib/deepl';
import { findBase64Fields, base64Error } from '@/lib/no-base64';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');
  const locale = searchParams.get('locale') || 'en';
  const all = searchParams.get('all') === '1';
  if (!section && !all) {
    return NextResponse.json({ error: 'Missing section' }, { status: 400 });
  }
  try {
    if (all) {
      // Un seul aller-retour pour l'admin settings (15 sections).
      const rows = await db.select().from(siteSettings);
      const bySection = new Map<string, { en?: any; fr?: any }>();
      for (const row of rows) {
        const entry = bySection.get(row.section) || {};
        if (row.locale === 'fr') entry.fr = row.data;
        else entry.en = row.data;
        bySection.set(row.section, entry);
      }
      const data: Record<string, any> = {};
      for (const [key, entry] of bySection) {
        data[key] = locale === 'fr' ? (entry.fr ?? entry.en) : (entry.en ?? entry.fr);
      }
      return NextResponse.json({ data });
    }
    const [row] = await db.select().from(siteSettings).where(
      and(eq(siteSettings.section, section!), eq(siteSettings.locale, locale))
    );
    return NextResponse.json({ data: row?.data ?? null });
  } catch {
    return NextResponse.json({ data: null });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const { section, data, locale } = await request.json();
    if (!section || !data) {
      return NextResponse.json({ error: 'Invalid section or data' }, { status: 400 });
    }
    const base64Fields = findBase64Fields(data);
    if (base64Fields.length) {
      return NextResponse.json(base64Error(base64Fields), { status: 400 });
    }
    // DB constraint is UNIQUE(section, locale) — the conflict target must
    // match it exactly, otherwise Postgres rejects the upsert.
    const [result] = await db
      .insert(siteSettings)
      .values({ section, data, locale: locale || 'en' })
      .onConflictDoUpdate({
        target: [siteSettings.section, siteSettings.locale],
        set: { data }
      })
      .returning();
    revalidatePath('/', 'layout');
    // Server-side invalidation (best-effort): the admin UI also calls
    // /api/admin/cache/invalidate, but the save must not depend on it.
    try { await invalidateSettings(); } catch {}
    // Auto-translate: an EN save creates the missing FR sibling via DeepL
    // (best-effort, budget-guarded, never breaks the save itself).
    let autoTranslated: string | null = null;
    if ((locale || 'en') === 'en') {
      try {
        const [frRow] = await db.select({ id: siteSettings.id }).from(siteSettings).where(
          and(eq(siteSettings.section, section), eq(siteSettings.locale, 'fr'))
        ).limit(1);
        if (!frRow) {
          const { data: frData, result } = await translateSettingsData(data);
          if (result.ok) {
            await db.insert(siteSettings).values({ section, data: frData as any, locale: 'fr' });
            try { await invalidateSettings(); } catch {}
            autoTranslated = `fr (${result.chars} chars)`;
          } else if (result.skipped) {
            autoTranslated = `skipped:${result.skipped}`;
          }
        }
      } catch {}
    }
    return NextResponse.json({ success: true, data: result, autoTranslated });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
