import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { defaultSettings } from '@/lib/settings-defaults';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');
  if (!section || !defaultSettings[section]) {
    return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
  }
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.section, section));
  return NextResponse.json({ data: row?.data ?? defaultSettings[section] });
}

export async function PUT(request: Request) {
  try {
    const { section, data } = await request.json();
    if (!section || !data || !defaultSettings[section]) {
      return NextResponse.json({ error: 'Invalid section or data' }, { status: 400 });
    }
    await db
      .insert(siteSettings)
      .values({ section, data })
      .onConflictDoUpdate({ target: siteSettings.section, set: { data, updatedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
