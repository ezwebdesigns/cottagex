import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

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
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ url: dataUrl });
  } catch {
    return NextResponse.json({ error: 'Upload error' }, { status: 500 });
  }
}