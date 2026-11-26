#!/usr/bin/env node
/**
 * ChaletExpress — réhébergement des photos vers Vercel Blob.
 *
 *   node --env-file=.env scripts/dfs-chalet-rehost-images.mjs            # dry-run
 *   node --env-file=.env scripts/dfs-chalet-rehost-images.mjs --write    # écriture
 *
 * Nécessite BLOB_READ_WRITE_TOKEN dans l'environnement (présent sur Vercel).
 * Les URL déjà auto-hébergées (supabase / blob / relatif) sont ignorées.
 */
import fs from 'fs'
import pg from 'pg'
import { put } from '@vercel/blob'

const WRITE = process.argv.includes('--write')
const LIMIT_ARG = process.argv.find((a) => a.startsWith('--limit='))
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split('=')[1]) || 50 : 50

// Le token Blob n'est pas dans le .env local de ce projet : on le reprend depuis
// un projet frère si besoin (jamais affiché).
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  for (const p of ['E:/PROJECTS/NEARME/.env', 'E:/PROJECTS/HEADSPANOW/.env.local']) {
    try {
      for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*(BLOB_READ_WRITE_TOKEN)\s*=\s*(.*)$/)
        if (m) process.env.BLOB_READ_WRITE_TOKEN = m[2].replace(/^["']|["']$/g, '')
      }
    } catch {}
    if (process.env.BLOB_READ_WRITE_TOKEN) break
  }
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN absent — ajoute-le dans .env.local (ou exécute sur Vercel).')
  process.exit(1)
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 4,
})
const hosted = (u) => /\.supabase\.co\/|\.public\.blob\.vercel-storage\.com\/|^\//i.test(String(u || ''))

const { rows } = await pool.query(
  `SELECT id, property_token, thumbnail, photos FROM affiliatecottages
   WHERE thumbnail LIKE 'https://lh3.googleusercontent.com%' OR photos::text LIKE '%lh3.googleusercontent.com%'
   ORDER BY updated_at DESC LIMIT $1`,
  [LIMIT]
)
console.log(`ChaletExpress — réhébergement ${WRITE ? 'ÉCRITURE' : 'DRY-RUN'} — ${rows.length} fiches`)

let done = 0
let images = 0
let errors = 0
for (const row of rows) {
  try {
    const photos = Array.isArray(row.photos) ? row.photos : JSON.parse(row.photos || '[]')
    const out = []
    for (let i = 0; i < photos.length; i++) {
      const url = photos[i]
      if (hosted(url)) { out.push(url); continue }
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
      if (!res.ok) continue
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 1000) continue
      const ext = (res.headers.get('content-type') || '').includes('png') ? 'png' : 'jpg'
      const blob = await put(`places/${row.property_token}/${i}-${Date.now()}.${ext}`, buf, {
        access: 'public', addRandomSuffix: true,
        contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
      })
      out.push(blob.url)
      images++
    }
    if (out.length) {
      if (WRITE) {
        await pool.query(
          'UPDATE affiliatecottages SET thumbnail = $1, photos = $2, updated_at = NOW() WHERE id = $3',
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
if (!WRITE) console.log('Dry-run : relance avec --write.')
