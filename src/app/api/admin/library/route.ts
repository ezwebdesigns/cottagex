import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { libraryImages } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';
import { uploadToBlob, deleteBlob, blobEnabled } from '@/lib/blob';

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const files = await db.select().from(libraryImages).orderBy(desc(libraryImages.createdAt));
  return NextResponse.json({ files });
}

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Images only' }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Max 5 MB' }, { status: 400 });

    const blobUrl = await uploadToBlob(file, 'library');
    let url = blobUrl ?? '';
    if (!url) {
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      url = `data:${file.type};base64,${base64}`;
    }

    const [image] = await db.insert(libraryImages).values({
      name: file.name,
      url,
      mimetype: file.type,
    }).returning();

    return NextResponse.json({ image, fallback: !blobEnabled() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Upload error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  const [existing] = await db.select().from(libraryImages).where(eq(libraryImages.id, Number(id))).limit(1);
  const [deleted] = await db.delete(libraryImages).where(eq(libraryImages.id, Number(id))).returning();
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (existing?.url) await deleteBlob(existing.url);
  return NextResponse.json({ ok: true });
}