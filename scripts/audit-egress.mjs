#!/usr/bin/env node
/**
 * Audit read-only des transferts : détecte toute image base64 réintroduite
 * dans les champs CMS et affiche le volume total des contenus servis.
 *
 *   node --env-file=.env scripts/audit-egress.mjs
 *   # sortie : OK si aucun base64, AUDIT FAIL sinon (exit 1)
 */
import fs from 'fs'
import pg from 'pg'

const url = fs.readFileSync('AGENTS.md', 'utf8').match(/postgresql:\/\/[^\s`]+/)[0]
const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })

const targets = [
  ['site_settings', 'data'],
  ['pages', 'location_data'],
  ['articles', 'content'],
  ['articles', 'featured_image'],
  ['affiliatecottages', 'thumbnail'],
  ['affiliatecottages', 'photos'],
  ['library_images', 'url'],
]

let failures = 0
let totalBytes = 0
console.log('Audit egress — ChaletExpress')
for (const [table, column] of targets) {
  const r = await pool.query(
    `SELECT count(*)::int n, coalesce(sum(length(${column}::text)),0)::bigint bytes FROM ${table} WHERE ${column} IS NOT NULL`
  )
  const bad = await pool.query(
    `SELECT count(*)::int n FROM ${table} WHERE ${column}::text LIKE '%data:image%'`
  )
  const { n, bytes } = r.rows[0]
  totalBytes += Number(bytes)
  const flag = bad.rows[0].n ? `  ⚠ ${bad.rows[0].n} ligne(s) base64` : ''
  console.log(`${table}.${column}: ${n} lignes, ${(Number(bytes) / 1024).toFixed(1)} Ko${flag}`)
  failures += bad.rows[0].n
}
console.log('='.repeat(60))
console.log(`TOTAL contenu DB: ${(totalBytes / 1024 / 1024).toFixed(2)} Mo`)
console.log(failures ? `AUDIT FAIL — ${failures} champ(s) base64` : 'AUDIT OK — aucun base64')
await pool.end()
process.exit(failures ? 1 : 0)
