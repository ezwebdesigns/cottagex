#!/usr/bin/env node
/**
 * Migre les images base64 restantes vers Vercel Blob :
 *   - site_settings.data      (homepage_destinations, seo, …)
 *   - pages.location_data     (provinces non couvertes par la passe précédente)
 *
 *   node --env-file=.env scripts/migrate-cms-images.mjs            # dry-run
 *   node --env-file=.env scripts/migrate-cms-images.mjs --write
 */
import pkg from 'pg'
import { put } from '@vercel/blob'
import { createHash } from 'node:crypto'

const { Pool } = pkg
const WRITE = process.argv.includes('--write')
const conn = process.env.DATABASE_URL
if (!conn) { console.error('DATABASE_URL absent'); process.exit(1) }
if (!process.env.BLOB_READ_WRITE_TOKEN) { console.error('BLOB_READ_WRITE_TOKEN absent'); process.exit(1) }
const pool = new Pool({ connectionString: conn, ssl: { rejectUnauthorized: false }, max: 4 })
const DATA_URL_RE = /data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]{500,})/g
const hashToUrl = new Map()
let uploaded = 0, reused = 0, rowsDone = 0, errors = 0

async function migrate(table, column, key, label, cast = 'jsonb') {
  const { rows } = await pool.query(
    `SELECT ${key} AS id, ${column}::text AS d FROM ${table} WHERE ${column}::text LIKE '%data:image%'`
  )
  console.log(`${table}.${column}: ${rows.length} ligne(s)`)
  for (const row of rows) {
    const matches = [...String(row.d).matchAll(DATA_URL_RE)]
    if (!matches.length) continue
    let updated = String(row.d)
    for (const m of matches) {
      const [full, mime, b64] = m
      const hash = createHash('sha256').update(b64).digest('hex').slice(0, 16)
      let url = hashToUrl.get(hash)
      if (url === undefined) {
        const ext = mime.split('/')[1].replace('jpeg', 'jpg')
        if (WRITE) {
          const buffer = Buffer.from(b64, 'base64')
          const blob = await put(`migrated/${label}-${hash.slice(0, 8)}.${ext}`, buffer, {
            access: 'public', contentType: mime, addRandomSuffix: true,
          })
          url = blob.url
          uploaded++
        } else url = `NEW(${label})`
        hashToUrl.set(hash, url)
      } else reused++
      if (WRITE) updated = updated.split(full).join(url)
    }
    if (WRITE && updated !== row.d) {
      await pool.query(`UPDATE ${table} SET ${column} = $1::${cast}, updated_at = CURRENT_TIMESTAMP WHERE ${key} = $2`, [updated, row.id])
      rowsDone++
    }
  }
}
try {
  await migrate('site_settings', 'data', 'id', 'settings')
  await migrate('pages', 'location_data', 'id', 'pages')
  await migrate('articles', 'featured_image', 'id', 'articles', 'text')
} catch (e) { errors++; console.error(e.message) }
await pool.end()
console.log('=' .repeat(60))
console.log(`${WRITE ? 'ÉCRITURE' : 'DRY-RUN'} lignes=${rowsDone} uploadées=${uploaded} réutilisées=${reused} erreurs=${errors}`)
