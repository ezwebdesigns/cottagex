import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { searchLinks } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  try {
    const query = db
      .select()
      .from(searchLinks)
      .orderBy(asc(searchLinks.city), asc(searchLinks.id));

    const rows = city
      ? await query.where(eq(searchLinks.city, city))
      : await query;

    return NextResponse.json(rows, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[api/search-links]', error);
    return NextResponse.json({ error: 'Failed to fetch search links', links: [] }, { status: 500 });
  }
}
