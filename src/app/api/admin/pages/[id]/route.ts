import { NextResponse } from 'next/server';

const STORAGE: any[] = [];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const page = STORAGE.find((p: any) => p.id === id);
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const idx = STORAGE.findIndex((p: any) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  STORAGE[idx] = { ...STORAGE[idx], ...body };
  return NextResponse.json({ page: STORAGE[idx] });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = STORAGE.findIndex((p: any) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  STORAGE.splice(idx, 1);
  return NextResponse.json({ success: true });
}
