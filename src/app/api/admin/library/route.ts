import { NextResponse } from 'next/server';

const IMAGES: any[] = [];

export async function GET() {
  return NextResponse.json({ files: IMAGES });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Images only' }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Max 5 MB' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const url = `data:${file.type};base64,${base64}`;
    const image = { id: Date.now().toString(), name: file.name, mimetype: file.type, url, createdAt: new Date().toISOString() };
    IMAGES.push(image);

    return NextResponse.json({ image }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Upload error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  const idx = IMAGES.findIndex((img: any) => img.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  IMAGES.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
