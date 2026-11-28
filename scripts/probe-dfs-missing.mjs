// Probe MISSING verdicts with alternate location/date variants (NO DB writes)
import pg from 'pg'
import { loadDfsEnv, dataforseoEnabled } from '../src/lib/dataforseo.ts'

loadDfsEnv(['E:/PROJECTS/TOOLS/dfs-test/.env.local'])
if (!dataforseoEnabled()) { console.error('DFS credentials missing'); process.exit(1) }

const DFS_BASE = process.env.DATAFORSEO_BASE || 'https://api.dataforseo.com'
const cred = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_API_PASSWORD}`).toString('base64')
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 4 })

const { rows } = await pool.query(`
  SELECT id, name, property_token, province
  FROM affiliatecottages
  WHERE id IN (
    'acadian-peninsula-ChkQrenKnKuzrc0qGg0vZy8xMXlscWI1MHY3EAI',
    'acadian-peninsula-ChkQro2Opom19oBgGg0vZy8xMW45YzRqMHdkEAI',
    'alberta-wide-ChoQ-Iz22-jtztGuARoNL2cvMTF6Mzlydzg2ORAC'
  )
`)
const CANON = { 'new brunswick': 'New Brunswick', alberta: 'Alberta' }
const variants = [
  { name: 'edited-cap + 45j', loc: c => `${CANON[c.province.toLowerCase()] || c.province},Canada`, dates: { check_in: '2027-01-15', check_out: '2027-01-17' } },
  { name: 'edited-cap + 14j', loc: c => `${CANON[c.province.toLowerCase()] || c.province},Canada`, dates: { check_in: '2026-12-11', check_out: '2026-12-13' } },
  { name: 'no location + 14j', loc: () => undefined, dates: { check_in: '2026-12-11', check_out: '2026-12-13' } },
]

async function call(task) {
  const res = await fetch(`${DFS_BASE}/v3/business_data/google/hotel_info/live/advanced`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${cred}` },
    body: JSON.stringify([task]),
    signal: AbortSignal.timeout(120000),
  })
  const j = await res.json()
  const t = j?.tasks?.[0]
  return { code: t?.status_code, msg: t?.status_message, result: !!t?.result?.[0], cost: j?.cost }
}

for (const c of rows) {
  console.log('\n', c.id, '|', c.name)
  for (const v of variants) {
    const task = {
      hotel_identifier: c.property_token,
      ...(v.loc(c) ? { location_name: v.loc(c) } : {}),
      language_code: 'en', currency: 'CAD', ...v.dates, adults: 2,
    }
    const r = await call(task)
    console.log(' ', v.name.padEnd(18), '→', r.code, r.msg, '| result:', r.result, '| $', r.cost)
  }
}
await pool.end()
