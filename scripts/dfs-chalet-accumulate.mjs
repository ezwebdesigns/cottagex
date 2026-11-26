#!/usr/bin/env node
/**
 * ChaletExpress — accumulation DataForSEO (Google Hotels / vacation rentals).
 *
 *   node --env-file=.env scripts/dfs-chalet-accumulate.mjs                 # dry-run
 *   node --env-file=.env scripts/dfs-chalet-accumulate.mjs --write         # écriture
 *   node --env-file=.env scripts/dfs-chalet-accumulate.mjs --cities=muskoka,tofino --write
 *   node --env-file=.env scripts/dfs-chalet-accumulate.mjs --write --force # ré-enrichit tout
 *
 * Coût Live : $0.004 par SERP (44 destinations = $0.176) + $0.004 par fiche
 * enrichie via Hotel Info (uniquement les fiches nouvelles ou périmées).
 */
import { put } from '@vercel/blob'
import pg from 'pg'
import {
  DESTINATIONS, dataforseoEnabled, loadDfsEnv, dfHotelSearch, dfHotelInfo,
  mapHotelToCottage, locationName, stayDates,
} from '../src/lib/dataforseo.ts'

loadDfsEnv(['E:/PROJECTS/TOOLS/dfs-test/.env.local'])

const args = process.argv.slice(2)
const WRITE = args.includes('--write')
const FORCE = args.includes('--force')
const NO_REHOST = args.includes('--no-rehost')
const citiesArg = args.find((a) => a.startsWith('--cities='))
const limitArg = args.find((a) => a.startsWith('--limit='))
const LIMIT = limitArg ? Math.max(1, Number(limitArg.split('=')[1]) || 12) : 12
const destinations = citiesArg
  ? DESTINATIONS.filter((d) => citiesArg.split('=')[1].split(',').map((s) => s.trim()).includes(d.slug))
  : DESTINATIONS

if (!dataforseoEnabled()) {
  console.error('DATAFORSEO_LOGIN / DATAFORSEO_API_PASSWORD absents de l’environnement.')
  process.exit(1)
}

const dates = stayDates()
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 4,
})
const alreadyHosted = (url) => /\.supabase\.co\/|\.public\.blob\.vercel-storage\.com\/|^\//i.test(String(url || ''))

async function rehostPhoto(url, id, index) {
  if (!url || !/^https?:\/\//i.test(url)) return null
  if (alreadyHosted(url)) return url
  if (NO_REHOST || !process.env.BLOB_READ_WRITE_TOKEN) return url
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 1000) return null
    const ext = (res.headers.get('content-type') || 'image/jpeg').includes('png') ? 'png' : 'jpg'
    const blob = await put(`places/${id}/${index}-${Date.now()}.${ext}`, buf, {
      access: 'public', addRandomSuffix: true, contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
    })
    return blob.url
  } catch {
    return null
  }
}

console.log(`\nChaletExpress — ${WRITE ? 'ÉCRITURE' : 'DRY-RUN'} — ${destinations.length} destinations`)
console.log(`Séjour : ${dates.check_in} → ${dates.check_out} | limite ${LIMIT}/destination | enrichissement ${FORCE ? 'forcé' : 'des nouveautés uniquement'}`)
console.log('='.repeat(90))

let raw = 0
const collected = new Map()
for (const dest of destinations) {
  const items = await dfHotelSearch({
    keyword: dest.query,
    location_name: locationName(dest.province),
    language_code: dest.hl || 'en',
    ...dates,
  })
  raw += items.length
  for (const it of items.slice(0, LIMIT)) {
    const id = String(it?.hotel_identifier || '')
    if (!id || !it?.title) continue
    if (!collected.has(id)) collected.set(id, { item: it, dest })
  }
  console.log(`${String(dest.slug).padEnd(20)} fiches=${String(items.length).padStart(3)} (prises ${Math.min(LIMIT, items.length)}) | cumul unique=${collected.size}`)
}

// Ignore les fiches déjà fraîchement synchronisées (économie sur Hotel Info).
let skipFresh = 0
if (!FORCE && collected.size > 0) {
  const ids = [...collected.keys()]
  const found = new Set()
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200)
    const q = await pool.query(
      `SELECT property_token FROM affiliatecottages WHERE property_token = ANY($1) AND last_synced > CURRENT_DATE - 30`,
      [chunk]
    )
    for (const r of q.rows) found.add(r.property_token)
  }
  for (const id of found) { collected.delete(id); skipFresh++ }
}

console.log(`Uniques=${collected.size} | déjà frais ignorés=${skipFresh} | brut=${raw}`)

let enriched = 0
let photos = 0
let written = 0
let errors = 0
const entries = [...collected.entries()]
for (let i = 0; i < entries.length; i++) {
  const [id, { item, dest }] = entries[i]
  try {
    const info = await dfHotelInfo(id, { location_name: locationName(dest.province), language_code: dest.hl || 'en', ...dates })
    if (info) enriched++

    const urls = (item?.overview_images || info?.overview_images || [])
      .filter((u) => typeof u === 'string')
      .slice(0, 6)
    const hosted = []
    for (let j = 0; j < urls.length; j++) {
      const u = await rehostPhoto(urls[j], id, j)
      if (u) hosted.push(u)
    }
    photos += hosted.length

    const row = mapHotelToCottage(item, info, dest, dates, hosted)
    if (WRITE) {
      const cols = Object.keys(row)
      const vals = cols.map((c) => row[c])
      const params = cols.map((_, k) => `$${k + 1}`).join(',')
      const updates = cols
        .filter((c) => !['id', 'property_token', 'affiliate_url', 'available'].includes(c))
        .map((c) => `${c} = EXCLUDED.${c}`)
        .join(', ')
      await pool.query(
        `INSERT INTO affiliatecottages (${cols.join(',')}) VALUES (${params})
         ON CONFLICT (property_token) DO UPDATE SET ${updates}, available = true`,
        vals
      )
      written++
    }
    if ((i + 1) % 20 === 0) console.log(`  ... ${i + 1}/${entries.length} | enrichis=${enriched} | photos=${photos} | écrits=${written}`)
  } catch (e) {
    errors++
    console.error(`[${id}] ${e instanceof Error ? e.message : e}`)
  }
}

await pool.end()
console.log('='.repeat(90))
console.log(`TOTAL brut=${raw} | uniques=${collected.size} | enrichis=${enriched} | photos=${photos} | écrits=${written} | erreurs=${errors}`)
if (!WRITE) console.log('Dry-run : relance avec --write pour écrire.')
