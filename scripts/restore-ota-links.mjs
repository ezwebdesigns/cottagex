// Restore OTA links archived in dfs-ota-links.jsonl into affiliatecottages.
// Dry-run by default. Explicit --write required for DB writes.
// No external API calls, no cost. Never overwrites a row that already has OTA links.
import fs from 'node:fs'
import pg from 'pg'

const FILE = 'C:/Users/mday/AppData/Local/hermes/cache/scratch/dfs-ota-links.jsonl'
const WRITE = process.argv.includes('--write')

const recs = fs.readFileSync(FILE, 'utf8').split(/\r?\n/).filter(Boolean).map(l => JSON.parse(l))
const archive = new Map()
for (const r of recs) {
  const id = String(r.id || '')
  const links = Array.isArray(r.links) ? r.links : []
  if (!id || !links.length) continue
  if (!archive.has(id)) archive.set(id, { links, province: r.province || '', name: r.name || '' })
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ...(/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '') ? {} : { ssl: { rejectUnauthorized: false } }),
})

const ids = [...archive.keys()]
const { rows: current } = await pool.query(`
  SELECT id,
         CASE WHEN ota_links <> '{}'::jsonb AND ota_links <> '[]'::jsonb THEN true ELSE false END AS has_ota,
         is_featured, affiliate_url
  FROM affiliatecottages WHERE id = ANY($1::text[])
`, [ids])

const byId = new Map(current.map(r => [r.id, r]))
const candidates = []
for (const [id, rec] of archive) {
  const db = byId.get(id)
  if (!db || db.has_ota) continue
  candidates.push({ id, ...rec })
}

console.log(`MODE: ${WRITE ? 'WRITE' : 'DRY-RUN'}`)
console.log('Archive records with links:', archive.size)
console.log('Found in DB:', current.length)
console.log('Candidates to restore (empty ota_links):', candidates.length)
const byProv = {}
for (const c of candidates) byProv[c.province || '(unknown)'] = (byProv[c.province || '(unknown)'] || 0) + 1
console.log('By province:', JSON.stringify(byProv))
console.log('Sample:', JSON.stringify(candidates.slice(0, 5).map(c => ({ id: c.id, name: c.name.slice(0, 45), province: c.province })), null, 2))

if (!WRITE) {
  console.log('DRY-RUN — no DB writes. Relance avec --write pour appliquer.')
  await pool.end()
  process.exit(0)
}

let applied = 0
for (const c of candidates) {
  try {
    await pool.query(
      `UPDATE affiliatecottages SET ota_links = $1::jsonb, updated_at = now()
       WHERE id = $2 AND (ota_links = '{}'::jsonb OR ota_links = '[]'::jsonb OR ota_links IS NULL)`,
      [JSON.stringify(c.links), c.id]
    )
    applied++
  } catch (e) {
    console.error('ERR', c.id, String(e.message).slice(0, 120))
  }
}
console.log('RESTORED:', applied, 'of', candidates.length)

const { rows: check } = await pool.query(`
  SELECT count(*)::int AS total,
         count(*) FILTER (WHERE ota_links <> '{}'::jsonb AND ota_links <> '[]'::jsonb)::int AS with_ota,
         count(*) FILTER (WHERE is_featured = false AND ota_links <> '{}'::jsonb AND ota_links <> '[]'::jsonb)::int AS standard_with_ota
  FROM affiliatecottages
`)
console.log('AFTER', JSON.stringify(check[0], null, 2))
await pool.end()
