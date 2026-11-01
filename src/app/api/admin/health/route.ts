import { Pool } from 'pg'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const connectionString = process.env.DATABASE_URL
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString || '')
const pool = new Pool({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
})

function checkBasicAuth(request: Request): boolean {
  const header = request.headers.get('authorization')
  if (!header || !header.startsWith('Basic ')) return false
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf-8')
  const [user, pass] = decoded.split(':')
  return user === process.env.ADMIN_USERNAME && pass === (process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD)
}

export async function GET(request: Request) {
  // Accept NextAuth session OR HTTP Basic Auth for monitoring
  let isAuthed = false
  try {
    const session = await auth()
    if (session?.user) isAuthed = true
  } catch {}
  if (!isAuthed && checkBasicAuth(request)) isAuthed = true
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_cottages,
        MAX(last_synced) as last_sync,
        COUNT(CASE WHEN available = true THEN 1 END) as available,
        COUNT(CASE WHEN available = false THEN 1 END) as unavailable
      FROM affiliatecottages
    `)
    
    const stats = result.rows[0]
    
    return NextResponse.json({
      status: 'ok',
      serpapi: {
        enabled: true,
        provider: 'serpapi',
        cron: true,
        lastSync: stats.last_sync,
        totalCottages: parseInt(stats.total_cottages) || 0,
        available: parseInt(stats.available) || 0,
        unavailable: parseInt(stats.unavailable) || 0,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      serpapi: {
        enabled: true,
        provider: 'serpapi',
        cron: true,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
