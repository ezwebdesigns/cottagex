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
  const sort     = (searchParams.get('sort') || 'rating') as 'rating' | 'price'
  const category = searchParams.get('category') || ''

  // Validation basique
  if (!slug && !province) {
    return NextResponse.json(
      { error: 'slug or province required' },
      { status: 400 }
    )
  }

  if (limit < 1 || limit > 20) {
    return NextResponse.json(
      { error: 'limit must be between 1 and 20' },
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
    })

    return NextResponse.json(
      { cottages },
      {
        headers: {
          // Cache 1h côté CDN Vercel
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
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
