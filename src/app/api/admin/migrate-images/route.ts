import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { migrateAllImages } from '@/lib/migrate-images';

export async function POST() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const result = await migrateAllImages();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Migration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
