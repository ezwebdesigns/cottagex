import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { invalidateSettings, invalidateArticles, invalidatePages, invalidateCottages, clearProjectCache } from '@/lib/cache'

export async function POST(request: Request) {
  const unauthorized = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const { type } = body

    switch (type) {
      case 'settings':
        await invalidateSettings()
        break
      case 'articles':
        await invalidateArticles()
        break
      case 'pages':
        await invalidatePages()
        break
      case 'cottages':
        await invalidateCottages()
        break
      case 'all':
        await clearProjectCache()
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Failed to invalidate cache:', e)
    return NextResponse.json({ error: 'Failed to invalidate cache' }, { status: 500 })
  }
}