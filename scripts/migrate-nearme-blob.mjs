#!/usr/bin/env node
/**
 * ChaletExpress — migration des photos du store NEARME vers le store du projet.
 *
 *   node --env-file=.env scripts/migrate-nearme-blob.mjs            # dry-run
 *   node --env-file=.env scripts/migrate-nearme-blob.mjs --write --limit=40
 *
 * N'utilise QUE BLOB_READ_WRITE_TOKEN de ChaletExpress (.env / Vercel).
 * Aucun repli vers un token d'un autre projet : les images restent séparées.
 */
import pg from 'pg'
import { put } from '@vercel/blob'
import fs from 'fs'

const WRITE = process.argv.includes('--write')
const limitArg = process.argv.find((a) => a.startsWith('--limit='))
const LIMIT = limitArg ? Math.max(1, Number(limitArg.split('=')[1]) || 40) : 40
const SOURCE_HOST = 'vfqpkyi36bcmdgzy.public.blob.vercel-storage.com'
const EXPECTED_STORE = 'vlnh9d6siarbizgq'

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN absent — lancer avec --env-file=.env')
  process.exit(1)
}

const connectionString = fs.readFileSync('AGENTS.md', 'utf8').match(/postgresql:\/\/[^\s`]+/)[0]
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 4 })

const { rows } = await pool.query(
  `SELECT id, property_token, thumbnail, photos FROM affiliatecottages
   WHERE thumbnail LIKE '%${SOURCE_HOST}%' OR photos::text LIKE '%${SOURCE_HOST}%'
   ORDER BY id LIMIT $1`,
  [LIMIT]
)
console.log(`Migration Blob ${WRITE ? 'ÉCRITURE' : 'DRY-RUN'} — ${rows.length} fiches`)

let done = 0, images = 0, errors = 0
for (const row of rows) {
  try {
    const photos = Array.isArray(row.photos) ? row.photos : JSON.parse(row.photos || '[]')
    const out = []
    for (let i = 0; i < photos.length; i++) {
      const url = String(photos[i] || '')
      if (!url.includes(SOURCE_HOST)) { out.push(url); continue }
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
      if (!res.ok) continue
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 1000) continue
      const ext = (res.headers.get('content-type') || '').includes('png') ? 'png' : 'jpg'
      const blob = await put(`places/${row.property_token}/${i}-migrated-${Date.now()}.${ext}`, buf, {
        access: 'public', addRandomSuffix: true,
        contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
      })
      if (!blob.url.includes(EXPECTED_STORE)) {
        throw new Error(`Mauvais store (${new URL(blob.url).host}) — token incorrect`)
      }
      out.push(blob.url)
      images++
    }
    if (out.length && out[0] !== row.thumbnail) {
      if (WRITE) {
        await pool.query(
          'UPDATE affiliatecottages SET thumbnail=$1, photos=$2, updated_at=NOW() WHERE id=$3',
          [out[0], JSON.stringify(out), row.id]
        )
      }
      done++
    }
  } catch (e) {
    errors++
    console.error(`[${row.property_token}] ${e instanceof Error ? e.message : e}`)
  }
}
await pool.end()
console.log('='.repeat(80))
console.log(`TOTAL fiches=${done} images=${images} erreurs=${errors}`)
if (!WRITE) console.log('Dry-run : relancer avec --write.')
