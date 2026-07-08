import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { libraryImages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [image] = await db.select().from(libraryImages).where(eq(libraryImages.id, Number(id)));
  if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(image);
}
