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
  const featuredOnly = searchParams.get('featured') === 'true'
  const affiliateOnly = searchParams.get('affiliateOnly') === 'true'

  if (limit < 1 || limit > 20) {
    return NextResponse.json(
      { error: 'limit must be between 1 and 20' },
      { status: 400 }
    )
  }

  try {
    console.log('[api/cottages] params:', { slug, limit, sort, category, featuredOnly })
    const cottages = await getCottages({
      slug,
      province,
      limit,
      sort,
      categories: category ? [category] : [],
      featuredOnly,
      affiliateOnly,
    })

    return NextResponse.json(
      { cottages },
      {
        headers: {
          // Cache 1h côté CDN Vercel
          'Cache-Control': 'no-cache, no-store, must-revalidate',
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
