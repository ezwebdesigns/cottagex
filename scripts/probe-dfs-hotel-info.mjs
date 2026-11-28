// Probe DataForSEO hotel_info for one cottage with affiliate_url (NO DB writes)
import pg from 'pg'
import { loadDfsEnv, dataforseoEnabled, stayDates, locationName } from '../src/lib/dataforseo.ts'

loadDfsEnv(['E:/PROJECTS/TOOLS/dfs-test/.env.local'])
if (!dataforseoEnabled()) { console.error('DFS credentials missing'); process.exit(1) }

const DFS_BASE = process.env.DATAFORSEO_BASE || 'https://api.dataforseo.com'
const cred = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_API_PASSWORD}`).toString('base64')
const dates = stayDates()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 4 })
const { rows } = await pool.query(`
  SELECT id, name, property_token, province, affiliate_url, google_link
  FROM affiliatecottages
  WHERE affiliate_url IS NOT NULL AND affiliate_url <> '' AND property_token IS NOT NULL
  ORDER BY id LIMIT 1
`)
const c = rows[0]
console.log('Cottage:', c.id, '| token:', c.property_token, '| province:', c.province)
console.log('Dates:', dates)

const task = {
  hotel_identifier: c.property_token,
  location_name: locationName(c.province),
  language_code: 'en',
  currency: 'CAD',
  check_in: dates.check_in,
  check_out: dates.check_out,
  adults: 2,
}

const res = await fetch(`${DFS_BASE}/v3/business_data/google/hotel_info/live/advanced`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Basic ${cred}` },
  body: JSON.stringify([task]),
  signal: AbortSignal.timeout(120000),
})
const j = await res.json()
const t = j?.tasks?.[0]
console.log('HTTP:', res.status)
console.log('API cost:', j?.cost, '| task cost:', t?.cost)
console.log('Task status:', t?.status_code, t?.status_message)
const r = t?.result?.[0]
console.log('Result present:', !!r)
if (r) {
  console.log('Result keys:', Object.keys(r).slice(0, 30).join(', '))
  console.log('Title:', r.title)
  console.log('Check URL:', r.check_url)
  console.log('Prices items:', r.prices?.items?.length ?? 0)
  console.log('About keys:', Object.keys(r.about || {}).slice(0, 15).join(', '))
}
await pool.end()
