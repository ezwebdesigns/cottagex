import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 2 MB)' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Images only' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const blob = await put(file.name, Buffer.from(bytes), {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
      storeId: process.env.VERCEL_BLOB_STORE_ID,
    });

    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: 'Upload error' }, { status: 500 });
  }
}