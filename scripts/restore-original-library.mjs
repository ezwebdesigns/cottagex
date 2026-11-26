#!/usr/bin/env node
/**
 * Fidélité : remplace les 30 URL de library_images par les ORIGINAUX
 * récupérés dans l'ancien store privé, ré-uploadés en public.
 *
 *   node --env-file=.env scripts/restore-original-library.mjs            # dry-run
 *   node --env-file=.env scripts/restore-original-library.mjs --write
 */
import fs from 'fs'
import pg from 'pg'
import { list, put } from '@vercel/blob'

const WRITE = process.argv.includes('--write')
const privateToken = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN
const publicToken = process.env.BLOB_READ_WRITE_TOKEN
if (!privateToken || !publicToken) { console.error('Tokens manquants'); process.exit(1) }
const dbUrl = fs.readFileSync('AGENTS.md', 'utf8').match(/postgresql:\/\/[^\s`]+/)[0]
const pool = new pg.Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })

// 1. Lister le store privé
const all = []
let cursor
for (;;) {
  const r = await list({ token: privateToken, limit: 1000, ...(cursor ? { cursor } : {}) })
  all.push(...r.blobs.filter((b) => b.pathname.startsWith('migrated/')))
  if (!r.hasMore) break
  cursor = r.cursor
}
const byId = new Map()
for (const b of all) {
  const m = b.pathname.match(/^migrated\/(\d+)-/)
  if (m && !byId.has(Number(m[1]))) byId.set(Number(m[1]), b)
}
console.log(`Store privé : ${all.length} blobs migrated/, ${byId.size} ids uniques`)

// 2. Récupérer les lignes à corriger
const { rows } = await pool.query('SELECT id, name, mimetype FROM library_images ORDER BY id')
const targets = rows.filter((r) => byId.has(Number(r.id)))
console.log(`Lignes library_images correspondent : ${targets.length}`)

let done = 0, errors = 0, skipped = 0
for (const row of targets) {
  const id = Number(row.id)
  const blob = byId.get(id)
  try {
    const res = await fetch(blob.url, { headers: { Authorization: `Bearer ${privateToken}` } })
    if (!res.ok) throw new Error(`téléchargement ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 100) throw new Error('fichier vide')
    let url
    if (WRITE) {
      const ext = (blob.pathname.split('.').pop() || 'png').replace('%20', '-')
      const up = await put(`library-original/${id}-${ext}`, buf, {
        token: publicToken, access: 'public', addRandomSuffix: true,
        contentType: row.mimetype || 'application/octet-stream',
      })
      url = up.url
      await pool.query('UPDATE library_images SET url=$1 WHERE id=$2', [url, id])
      done++
    } else url = `NEW(original ${buf.length} octets)`
    console.log(`OK ${id} ${row.name} ${buf.length}B -> ${url.slice(0, 72)}`)
  } catch (e) { errors++; console.error(`ERR ${id}: ${e.message}`) }
}
await pool.end()
console.log('='.repeat(60))
console.log(`${WRITE ? 'ÉCRITURE' : 'DRY-RUN'} restaurées=${done} erreurs=${errors} sans-original=${rows.length - targets.length - skipped}`)
