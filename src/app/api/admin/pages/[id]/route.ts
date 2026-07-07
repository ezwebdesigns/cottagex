import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const [page] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const body = await request.json();
  const [page] = await db.update(pages)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(pages.id, id))
    .returning();
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ page });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const [deleted] = await db.delete(pages).where(eq(pages.id, id)).returning();
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
