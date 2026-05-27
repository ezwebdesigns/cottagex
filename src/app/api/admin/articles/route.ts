import { NextResponse } from 'next/server';

const STORAGE: any[] = [];

export async function GET() {
  return NextResponse.json({ posts: STORAGE });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = body.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `article-${Date.now()}`;
    const post = {
      id: Date.now().toString(),
      slug,
      ...body,
      createdAt: new Date().toISOString(),
      publishedAt: body.isPublished ? new Date().toISOString() : null,
    };
    STORAGE.push(post);
    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
