#!/usr/bin/env node
/**
 * Remplace les URL de blobs PRIVÉS de library_images par des URL publiques.
 * Les originaux ne sont plus téléchargeables (store historique, token absent),
 * on ré-uploie les équivalents locaux et on réutilise les photos déjà migrées.
 *
 *   node --env-file=.env scripts/migrate-private-library.mjs            # dry-run
 *   node --env-file=.env scripts/migrate-private-library.mjs --write
 */
import fs from 'fs'
import pg from 'pg'
import { put } from '@vercel/blob'

const WRITE = process.argv.includes('--write')
if (!process.env.BLOB_READ_WRITE_TOKEN) { console.error('BLOB_READ_WRITE_TOKEN absent'); process.exit(1) }
const url = fs.readFileSync('AGENTS.md', 'utf8').match(/postgresql:\/\/[^\s`]+/)[0]
const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })

const P = 'https://vlnh9d6siarbizgq.public.blob.vercel-storage.com/migrated/'
const photos = [
  `${P}settings-0cb5b6eb-ECTxuZ5wCCMk2yj4N0X0SSwZISuCIX.jpg`,
  `${P}settings-f2442248-UbelNJ2QP40W4Qj4MOUAZNDJnfFbWC.jpg`,
  `${P}settings-6d038715-22Dw68a8twPXzJGdejEURiLqFEAwUd.png`,
  `${P}settings-a4dded93-N7docl5NlnCSVj2v5UWMGsLf92ST20.jpg`,
  `${P}settings-afb7fffc-TMKqbStgR8p2bP8nSlu9n8T4xeQ6j8.jpg`,
]
// id -> fichier local OU URL publique existante
const local = {
  1: 'public/android-chrome-192x192.png',
  2: 'public/android-chrome-192x192.png',
  6: 'public/favicon.ico',
  9: 'public/logo.png',
  51: 'public/logo.png',
  62: 'public/images/vrbo3.png',
  63: 'public/images/expedia3.png',
  64: 'public/logo-chaletexpress-footer.png',
  66: 'public/android-chrome-192x192.png',
  50: 'public/logo.png',
}
const reused = {
  10: photos[0], 12: photos[1], 13: photos[0], 18: photos[1], 27: photos[2],
  28: photos[3], 29: photos[0], 30: photos[1], 31: photos[2], 32: photos[3],
  33: photos[4], 35: photos[0], 41: photos[1], 44: photos[2], 48: photos[3],
  49: photos[3], 56: photos[0], 57: photos[4], 58: photos[1], 59: photos[2],
}

const { rows } = await pool.query(
  "SELECT id, name, mimetype FROM library_images WHERE url LIKE '%.private.blob.vercel-storage.com%' ORDER BY id"
)
console.log(`${rows.length} lignes privées`)
let done = 0, errors = 0
for (const row of rows) {
  try {
    const id = Number(row.id)
    let publicUrl
    if (local[id]) {
      const buf = fs.readFileSync(local[id])
      if (WRITE) {
        const ext = local[id].split('.').pop()
        const blob = await put(`library/${id}-${row.name}.${ext}`, buf, {
          access: 'public', addRandomSuffix: true, contentType: row.mimetype,
        })
        publicUrl = blob.url
      } else publicUrl = 'NEW(local)'
    } else if (reused[id]) publicUrl = reused[id]
    else { console.log(`IGNORÉ ${id} ${row.name} (aucune source)`); continue }
    if (WRITE) {
      await pool.query('UPDATE library_images SET url=$1 WHERE id=$2', [publicUrl, id])
      done++
    }
    console.log(`OK ${id} ${row.name} -> ${publicUrl.slice(0, 70)}`)
  } catch (e) { errors++; console.error(`ERR ${row.id}: ${e.message}`) }
}
await pool.end()
console.log('='.repeat(60))
console.log(`${WRITE ? 'ÉCRITURE' : 'DRY-RUN'} lignes=${done} erreurs=${errors}`)
