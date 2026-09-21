/**
 * app/api/cottages/route.ts
 * API Route — appelée par CottageShortcode côté client
 *
 * GET /api/cottages?slug=muskoka&limit=3&sort=rating&category=hotTub
 * GET /api/cottages?province=ontario&limit=5&sort=price&category=family
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCottages } from '@/lib/cottages'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const slug     = searchParams.get('slug')     || undefined
  const province = searchParams.get('province') || undefined
  const limit    = parseInt(searchParams.get('limit') || '3', 10)
  const sort     = (searchParams.get('sort') || 'rating') as 'rating' | 'price' | 'newest'
  const category     = searchParams.get('category') || ''
  const featuredOnly = searchParams.get('featured') !== 'false'
  const affiliateOnly = searchParams.get('affiliateOnly') === 'true'

  if (!Number.isFinite(limit) || limit < 1) {
    return NextResponse.json(
      { error: 'limit must be a positive number' },
      { status: 400 }
    )
  }

  try {
    const cottages = await getCottages({
      slug,
      province,
      limit,
      sort,
      categories: category ? [category] : [],
      featuredOnly,
      affiliateOnly,
    })

    // Cacheable at the edge: the underlying getCottages() result is
    // already cached server-side for 600s, so mirror that TTL here.
    // (Previously no-store: every shortcode re-fetched over HTTP.)
    return NextResponse.json(
      { cottages },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    console.error('[api/cottages]', error)
    return NextResponse.json(
      { error: 'Failed to fetch cottages', cottages: [] },
      { status: 500 }
    )
  }
}
