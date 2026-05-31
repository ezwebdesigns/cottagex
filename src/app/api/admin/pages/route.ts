import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pages } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  const all = await db.select().from(pages).orderBy(desc(pages.createdAt));
  return NextResponse.json({ pages: all });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = body.slug || body.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `page-${Date.now()}`;
    const [page] = await db.insert(pages).values({
      title: body.title,
      slug,
      template: body.template || 'standard',
      content: body.content || '',
      seoTitle: body.seoTitle,
      metaDescription: body.metaDescription,
      featuredImage: body.featuredImage,
      faq: body.faq || [],
      ctaTitle: body.ctaTitle,
      ctaButton: body.ctaButton,
      ctaLink: body.ctaLink,
      exploreTitle: body.exploreTitle,
      exploreSubtitle: body.exploreSubtitle,
      exploreDescription: body.exploreDescription,
      exploreItems: body.exploreItems || [],
      locationData: body.locationData || {},
      isPublished: body.isPublished ?? true,
      publishedAt: body.isPublished ? new Date() : null,
    }).returning();
    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/pages', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
