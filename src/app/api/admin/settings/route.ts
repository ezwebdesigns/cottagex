import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');
  if (!section) {
    return NextResponse.json({ error: 'Missing section' }, { status: 400 });
  }
  try {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.section, section));
    return NextResponse.json({ data: row?.data ?? null });
  } catch {
    return NextResponse.json({ data: null });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const { section, data } = await request.json();
    if (!section || !data) {
      return NextResponse.json({ error: 'Invalid section or data' }, { status: 400 });
    }
    await db
      .insert(siteSettings)
      .values({ section, data })
      .onConflictDoUpdate({ target: siteSettings.section, set: { data, updatedAt: new Date() } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
