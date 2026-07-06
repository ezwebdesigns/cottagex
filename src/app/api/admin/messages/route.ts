import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const all = await db.select().from(messages).orderBy(desc(messages.createdAt));
  return NextResponse.json({ messages: all });
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const [msg] = await db.update(messages).set({ read: true }).where(eq(messages.id, Number(id))).returning();
    if (!msg) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: msg });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const [deleted] = await db.delete(messages).where(eq(messages.id, Number(id))).returning();
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
