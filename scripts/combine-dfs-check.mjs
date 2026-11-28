// Combine the two dry-run parts into one report (no API calls, no DB writes)
import fs from 'node:fs'
import pg from 'pg'

const log = fs.readFileSync('C:/Users/mday/AppData/Local/hermes/cache/scratch/dfs-check-full.log', 'utf8')
const second = JSON.parse(fs.readFileSync('C:/Users/mday/AppData/Local/hermes/cache/scratch/dfs-affiliate-check-2026-11-27T22-32-57-972Z.json', 'utf8'))
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 4 })
const { rows: firstRows } = await pool.query(`
  SELECT id, name, property_token, province, affiliate_url, google_link, available
  FROM affiliatecottages
  WHERE affiliate_url IS NOT NULL AND affiliate_url <> '' AND property_token IS NOT NULL AND property_token <> ''
  ORDER BY id LIMIT 81
`)

const re = /\[dfs-check\]\s+(\d+)\/130\s+([✓✗?])\s+(\d+)\s+(ALIVE|MISSING|UNKNOWN)\s+\$([\d.]+)\s+(.+)$/
const lines = log.split(/\r?\n/).map(l => l.match(re)).filter(Boolean)
console.log('Parsed first-part lines:', lines.length, '| DB rows:', firstRows.length)
if (lines.length !== firstRows.length) { console.error('MISMATCH'); process.exit(1) }

const combined = lines.map((m, i) => {
  const c = firstRows[i]
  // Le log affiche le coût CUMULÉ ; chaque appel coûte la différence avec la ligne précédente.
  const cum = Number(m[5])
  const prevCum = i === 0 ? 0 : Number(lines[i - 1][5])
  return {
    id: c.id, name: c.name, property_token: c.property_token, province: c.province,
    affiliate_url: c.affiliate_url, google_link: c.google_link, available: c.available,
    http: 200, status_code: Number(m[3]),
    verdict: m[4], cost: Number((cum - prevCum).toFixed(3)),
    action: m[4] === 'MISSING' ? 'would-disable' : 'kept',
  }
}).concat(second)
console.log('Combined rows:', combined.length)
const counts = {}
let cost = 0
for (const r of combined) { counts[r.verdict] = (counts[r.verdict] || 0) + 1; cost += Number(r.cost || 0) }
console.log('Counts:', counts, '| total cost $', cost.toFixed(3))

const out = 'C:/Users/mday/AppData/Local/hermes/cache/scratch/dfs-affiliate-check-COMBINED.json'
fs.writeFileSync(out, JSON.stringify(combined, null, 2), 'utf8')
const csv = ['id,name,property_token,status_code,verdict,affiliate_url,action']
  .concat(combined.map(r => [r.id, r.name, r.property_token, r.status_code, r.verdict, r.affiliate_url, r.action]
    .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))).join('\n')
const outCsv = 'C:/Users/mday/AppData/Local/hermes/cache/scratch/dfs-affiliate-check-COMBINED.csv'
fs.writeFileSync(outCsv, csv, 'utf8')
console.log('Wrote', out, 'and', outCsv)
await pool.end()
