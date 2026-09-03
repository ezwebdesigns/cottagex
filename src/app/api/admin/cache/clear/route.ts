import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { clearProjectCache } from '@/lib/cache'

export async function POST() {
  const unauthorized = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    await clearProjectCache()
    return NextResponse.json({ success: true, message: 'Cache cleared successfully' })
  } catch (e) {
    console.error('Failed to clear cache:', e)
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 })
  }
}