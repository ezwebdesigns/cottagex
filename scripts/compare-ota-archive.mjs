// Compare the archived OTA batch (dfs-ota-links.jsonl) with current DB state.
// Read-only. Tells how many already-stored OTA links can be restored for free.
import fs from 'node:fs'
import pg from 'pg'

const FILE = 'C:/Users/mday/AppData/Local/hermes/cache/scratch/dfs-ota-links.jsonl'
const recs = fs.readFileSync(FILE, 'utf8').split(/\r?\n/).filter(Boolean).map(l => JSON.parse(l))
const withLinks = recs.filter(r => Array.isArray(r.links) && r.links.length)
console.log('ARCHIVE records:', recs.length, 'with links:', withLinks.length)

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ...(/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '') ? {} : { ssl: { rejectUnauthorized: false } }),
})
const ids = withLinks.map(r => String(r.id))
const { rows } = await pool.query(`
  SELECT id,
         CASE WHEN ota_links <> '{}'::jsonb AND ota_links <> '[]'::jsonb THEN true ELSE false END AS has_ota,
         is_featured, affiliate_url
  FROM affiliatecottages WHERE id = ANY($1::text[])
`, [ids])
const map = new Map(rows.map(r => [r.id, r]))
let inDb = 0, stillHas = 0, missing = 0, empty = 0
for (const r of withLinks) {
  const db = map.get(String(r.id))
  if (!db) { missing++; continue }
  inDb++
  if (db.has_ota) stillHas++
  else empty++
}
console.log(JSON.stringify({
  archiveWithLinks: withLinks.length,
  foundInDb: inDb,
  stillHasOta: stillHas,
  otaEmptyNow: empty,
  notInDb: missing,
}, null, 2))
await pool.end()
