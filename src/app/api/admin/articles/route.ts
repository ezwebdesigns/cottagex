import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { articles } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const all = await db.select().from(articles).orderBy(desc(articles.createdAt));
  return NextResponse.json({ posts: all });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = body.slug || body.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `article-${Date.now()}`;
    const [post] = await db.insert(articles).values({
      title: body.title,
      slug,
      type: body.type || 'standard',
      content: body.content || '',
      excerpt: body.excerpt,
      category: body.category,
      author: body.author || 'Editorial Team',
      featuredImage: body.featuredImage,
      imageAlt: body.imageAlt,
      seoTitle: body.seoTitle,
      faq: body.faq || [],
      ctaTitle: body.ctaTitle,
      ctaButton: body.ctaButton,
      ctaLink: body.ctaLink,
      isPublished: body.isPublished ?? true,
      publishedAt: body.isPublished ? new Date() : null,
    }).returning();
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/articles', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
