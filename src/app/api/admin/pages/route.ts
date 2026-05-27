import { NextResponse } from 'next/server';

const STORAGE: any[] = [];

export async function GET() {
  return NextResponse.json({ pages: STORAGE });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const page = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
    STORAGE.push(page);
    return NextResponse.json({ page }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
