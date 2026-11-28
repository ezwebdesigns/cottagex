// Enrich EXISTING standard cottages that still have no OTA links.
// Dry-run by default: counts candidates + estimates cost, NO API calls, NO DB writes.
// Explicit --write required to call DataForSEO and write ota_links.
import pg from 'pg'
import { loadDfsEnv, dataforseoEnabled, stayDates, locationName } from '../src/lib/dataforseo.ts'

loadDfsEnv(['E:/PROJECTS/TOOLS/dfs-test/.env.local'])
const DFS_READY = dataforseoEnabled()
const WRITE = process.argv.includes('--write')
const arg = (name, def) => {
  const a = process.argv.find(x => x.startsWith(`--${name}=`))
  return a ? a.split('=')[1] : def
}
const MAX_COST = Number(arg('max-cost', 2))
const LIMIT = Number(arg('limit', 0)) || 0
const PROVINCE = arg('province', '')
const COST_PER_INFO = 0.004

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ...(/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '') ? {} : { ssl: { rejectUnauthorized: false } }),
  max: 4,
})

const { rows: candidates } = await pool.query(`
  SELECT property_token, province, name
  FROM affiliatecottages
  WHERE is_featured = false
    AND (ota_links IS NULL OR ota_links = '{}'::jsonb OR ota_links = '[]'::jsonb)
    AND property_token IS NOT NULL AND property_token <> ''
    ${PROVINCE ? 'AND province = $1' : ''}
  ORDER BY province, name
`, PROVINCE ? [PROVINCE] : [])

const byProv = {}
for (const c of candidates) byProv[c.province || '(none)'] = (byProv[c.province || '(none)'] || 0) + 1
const planned = LIMIT ? candidates.slice(0, LIMIT) : candidates

console.log('MODE:', WRITE ? 'WRITE' : 'DRY-RUN')
console.log('DFS credentials available:', DFS_READY)
console.log('Candidates without OTA:', candidates.length, '| planned this run:', planned.length)
console.log('By province:', JSON.stringify(byProv))
console.log('Estimated cost @ $0.004/info:', `$${(planned.length * COST_PER_INFO).toFixed(3)}`)
console.log('Cost cap:', `$${MAX_COST.toFixed(3)}`)

if (!WRITE) {
  console.log('DRY-RUN — no API calls, no DB writes. Relance avec --write pour exécuter.')
  await pool.end()
  process.exit(0)
}
if (!DFS_READY) { console.error('DFS credentials missing'); process.exit(1) }

const DFS_BASE = process.env.DATAFORSEO_BASE || 'https://api.dataforseo.com'
const cred = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_API_PASSWORD}`).toString('base64')
const dates = stayDates()
const TARGET = /vrbo\.com|booking\.com|expedia\.(com|ca)/i
let cost = 0, found = 0, applied = 0, errors = 0, calls = 0

async function post(task) {
  for (let a = 0; a < 3; a++) {
    try {
      const res = await fetch(`${DFS_BASE}/v3/business_data/google/hotel_info/live/advanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${cred}` },
        body: JSON.stringify([task]),
        signal: AbortSignal.timeout(120000),
      })
      if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 1500 * (a + 1))); continue }
      const j = await res.json()
      return { t: j?.tasks?.[0], cost: Number(j?.cost || j?.tasks?.[0]?.cost || 0) }
    } catch (e) {
      if (a === 2) throw e
      await new Promise(r => setTimeout(r, 1200 * (a + 1)))
    }
  }
  return { t: null, cost: 0 }
}

for (const c of planned) {
  if (cost >= MAX_COST) { console.log('COST CAP REACHED'); break }
  const task = {
    hotel_identifier: c.property_token,
    location_name: locationName(c.province),
    language_code: 'en',
    currency: 'CAD',
    check_in: dates.check_in,
    check_out: dates.check_out,
    adults: 2,
  }
  try {
    const { t, cost: cc } = await post(task)
    cost += cc || COST_PER_INFO
    calls++
    const prices = t?.result?.[0]?.prices?.items || []
    const links = prices
      .map(p => ({
        domain: String(p?.domain || ''),
        url: p?.url || '',
        title: p?.title || '',
        paid: !!p?.is_paid,
        official: !!p?.official_site,
        offers: (p?.offers || []).map(o => ({ title: o?.title || '', url: o?.url || '' })),
      }))
      .filter(l => l.url && TARGET.test(l.domain))
    if (!links.length) continue
    found++
    await pool.query(
      `UPDATE affiliatecottages SET ota_links = $1::jsonb, updated_at = now()
       WHERE property_token = $2 AND (ota_links = '{}'::jsonb OR ota_links = '[]'::jsonb OR ota_links IS NULL)`,
      [JSON.stringify(links), c.property_token]
    )
    applied++
  } catch (e) {
    errors++
    console.error('ERR', c.property_token, String(e.message).slice(0, 120))
  }
  if (calls % 25 === 0) console.log(`  ... calls=${calls} found=${found} applied=${applied} cost=$${cost.toFixed(3)}`)
}

const { rows: check } = await pool.query(`
  SELECT count(*) FILTER (WHERE ota_links <> '{}'::jsonb AND ota_links <> '[]'::jsonb)::int AS with_ota,
         count(*) FILTER (WHERE is_featured = false AND ota_links <> '{}'::jsonb AND ota_links <> '[]'::jsonb)::int AS standard_with_ota
  FROM affiliatecottages
`)
console.log('SUMMARY', JSON.stringify({ candidates: candidates.length, calls, found, applied, errors, cost: Number(cost.toFixed(3)), ...check[0] }, null, 2))
await pool.end()
