#!/usr/bin/env node
/**
 * ChaletExpress — extension OTA DataForSEO (dry-run par défaut).
 *
 *   node --env-file=.env scripts/dfs-chalet-expand-ota.mjs                 # dry-run
 *   node --env-file=.env scripts/dfs-chalet-expand-ota.mjs --write         # écriture
 *   node --env-file=.env scripts/dfs-chalet-expand-ota.mjs --cities=muskoka,tofino --write
 *   node --env-file=.env scripts/dfs-chalet-expand-ota.mjs --write --no-rehost
 *
 * Coût Live : $0.004 / recherche + $0.004 / fiche enrichie.
 * Garde-fou : --max-cost=8 (USD) par exécution.
 */
import pg from 'pg'
import { put } from '@vercel/blob'
import {
  DESTINATIONS, dataforseoEnabled, loadDfsEnv, stayDates,
} from '../src/lib/dataforseo.ts'

loadDfsEnv(['E:/PROJECTS/TOOLS/dfs-test/.env.local'])

const args = process.argv.slice(2)
const WRITE = args.includes('--write')
const NO_REHOST = args.includes('--no-rehost')
const FORCE = args.includes('--force')
const citiesArg = args.find(a => a.startsWith('--cities='))
const provinceArg = args.find(a => a.startsWith('--province='))
const maxCostArg = args.find(a => a.startsWith('--max-cost='))
const queriesArg = args.find(a => a.startsWith('--queries='))
const MAX_COST = maxCostArg ? Number(maxCostArg.split('=')[1]) || 8 : 8
const QUERIES = queriesArg ? Math.max(1, Number(queriesArg.split('=')[1]) || 2) : 2

const CANON = {
  alberta: 'Alberta', 'british-columbia': 'British Columbia', manitoba: 'Manitoba',
  'new-brunswick': 'New Brunswick', 'nova-scotia': 'Nova Scotia', ontario: 'Ontario',
  pei: 'Prince Edward Island', saskatchewan: 'Saskatchewan', quebec: 'Quebec',
}
const TARGET = ['vrbo.com', 'expedia.com', 'expedia.ca', 'booking.com']
const DFS_BASE = process.env.DATAFORSEO_BASE || 'https://api.dataforseo.com'
const cred = Buffer.from(`${process.env.DATAFORSEO_LOGIN || ''}:${process.env.DATAFORSEO_API_PASSWORD || ''}`).toString('base64')

if (!dataforseoEnabled()) {
  console.error('Identifiants DataForSEO absents.')
  process.exit(1)
}

const dates = stayDates()
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 4 })
const wanted = citiesArg ? citiesArg.split('=')[1].split(',').map(s => s.trim()) : null
const province = provinceArg ? provinceArg.split('=')[1].trim() : null
const dests = DESTINATIONS.filter(d => (!wanted || wanted.includes(d.slug)) && (!province || d.province === province))

// Normalisation des étiquettes provinciales (toutes lignes, sans écrire).
if (args.find(a => a.startsWith('--normalize'))) {
  await pool.query(`
    update affiliatecottages
    set province = case
      when lower(trim(province)) in ('alberta') then 'Alberta'
      when lower(trim(province)) in ('british columbia','british-colony','british-columbia') then 'British Columbia'
      when lower(trim(province)) in ('manitoba') then 'Manitoba'
      when lower(trim(province)) in ('new brunswick','new-brunswick') then 'New Brunswick'
      when lower(trim(province)) in ('nova scotia','nova-scotia') then 'Nova Scotia'
      when lower(trim(province)) in ('ontario') then 'Ontario'
      when lower(trim(province)) in ('prince edward island','pei') then 'Prince Edward Island'
      when lower(trim(province)) in ('quebec') then 'Quebec'
      when lower(trim(province)) in ('saskatchewan') then 'Saskatchewan'
      else province
    end
  `)
  console.log('NORMALISÉ')
  await pool.end()
  process.exit(0)
}
// Variantes de requête : originale + dérivées du slug (plafonnées par --queries).
function variants(d) {
  const city = d.slug.replace(/-/g, ' ')
  const prov = CANON[d.province] || d.province
  const out = [d.query]
  if (QUERIES >= 2) out.push(`${city} cottage rental ${prov} canada`)
  if (QUERIES >= 3) out.push(`${city} vacation rental vrbo ${prov}`)
  if (QUERIES >= 4) out.push(`${city} cabin rental ${prov} canada`)
  return out.slice(0, QUERIES)
}

function loc(province) { return CANON[province] ? `${CANON[province]},Canada` : `${province},Canada` }

async function post(path, task) {
  for (let a = 0; a < 3; a++) {
    try {
      const res = await fetch(`${DFS_BASE}/v3/business_data/google${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${cred}` },
        body: JSON.stringify([task]),
        signal: AbortSignal.timeout(120000),
      })
      if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 1500 * (a + 1))); continue }
      const j = await res.json()
      const t = j?.tasks?.[0]
      return { t, cost: Number(j?.cost || t?.cost || 0) }
    } catch (e) {
      if (a === 2) throw e
      await new Promise(r => setTimeout(r, 1200 * (a + 1)))
    }
  }
  return { t: null, cost: 0 }
}

console.log(`\nExtension OTA — ${WRITE ? 'ÉCRITURE' : 'DRY-RUN'} — ${dests.length} destinations x ${QUERIES} requêtes`)
console.log(`Séjour ${dates.check_in} -> ${dates.check_out} | max-cost $${MAX_COST} | ${NO_REHOST ? 'sans' : 'avec'} réhébergement`)
console.log('='.repeat(88))

let cost = 0
const known = new Set()
{
  const r = await pool.query('select property_token from affiliatecottages')
  for (const x of r.rows) known.add(x.property_token)
}
const candidates = new Map()
let searches = 0
const tasks = []
for (const d of dests) for (const q of variants(d)) tasks.push({ d, q })
let ti = 0
async function searchWorker() {
  while (ti < tasks.length && cost < MAX_COST) {
    const { d, q } = tasks[ti++]
    const { t, cost: cc } = await post('/hotel_searches/live', {
      location_name: loc(d.province), language_code: d.hl || 'en', keyword: q,
      currency: 'CAD', ...dates, adults: 2, is_vacation_rentals: true,
      sort_by: 'highest_rating', depth: 18,
    })
    cost += cc; searches++
    const items = t?.result?.[0]?.items || []
    for (const it of items) {
      const id = String(it?.hotel_identifier || '')
      if (!id || !it?.title || known.has(id) || candidates.has(id)) continue
      candidates.set(id, { id, title: it.title, item: it, dest: d })
    }
  }
}
await Promise.all(Array.from({ length: 4 }, searchWorker))
console.log(`Recherches=${searches} | candidats uniques=${candidates.size} | déjà connus ignorés=${known.size} | coût recherche=$${cost.toFixed(3)}`)

const host = u => { const m = String(u || '').match(/^https?:\/\/([^/]+)/i); return m ? m[1].toLowerCase().replace(/^www\./, '') : '' }
const amenityNames = info => {
  const out = []
  for (const a of info?.about?.popular_amenities || []) if (a?.amenity) out.push(String(a.amenity).replace(/_/g, ' '))
  for (const a of info?.about?.amenities || []) {
    if (typeof a === 'string') out.push(a)
    else if (a?.amenity) out.push(String(a.amenity).replace(/_/g, ' '))
    else if (a?.items) for (const i of a.items) if (i?.amenity) out.push(String(i.amenity).replace(/_/g, ' '))
  }
  return Array.from(new Set(out)).slice(0, 20)
}
const clock = t => t && typeof t.hour === 'number' ? `${String(t.hour).padStart(2, '0')}:${String(t.minute || 0).padStart(2, '0')}` : null
const alreadyHosted = u => /\.supabase\.co\/|\.public\.blob\.vercel-storage\.com\/|^\//i.test(String(u || ''))

let enriched = 0, kept = 0, written = 0, errors = 0
const perCity = new Map(), perProv = new Map()
const entries = [...candidates.values()]
let ei = 0
async function enrichWorker() {
  while (ei < entries.length && cost < MAX_COST) {
    const x = entries[ei++]
    const { t, cost: cc } = await post('/hotel_info/live/advanced', {
      hotel_identifier: x.id, location_name: loc(x.dest.province),
      language_code: x.dest.hl || 'en', currency: 'CAD', ...dates, adults: 2,
    })
    cost += cc; enriched++
    const info = t?.result?.[0]
    if (!info) continue
    const prices = info?.prices?.items || []
    const links = prices.map(p => ({
      domain: p?.domain || host(p?.url), url: p?.url, title: p?.title,
      paid: !!p?.is_paid, official: !!p?.official_site,
      offers: (p?.offers || []).map(o => ({ title: o?.title, url: o?.url, domain: host(o?.url), max_visitors: o?.max_visitors })),
    })).filter(l => l.url || l.domain)
    const domains = [info?.about?.domain, ...links.map(l => l.domain), ...links.flatMap(l => l.offers.map(o => o.domain))]
      .map(v => typeof v === 'string' ? v.toLowerCase() : '').filter(Boolean)
    if (!domains.some(d => TARGET.some(t2 => d.includes(t2)))) continue
    kept++
    const urls = (x.item?.overview_images || info?.overview_images || []).filter(u => typeof u === 'string').slice(0, 6)
    const photos = []
    if (!NO_REHOST && process.env.BLOB_READ_WRITE_TOKEN) {
      for (let j = 0; j < urls.length; j++) {
        const u = urls[j]
        if (alreadyHosted(u)) { photos.push(u); continue }
        try {
          const res = await fetch(u, { signal: AbortSignal.timeout(30000) })
          if (!res.ok) continue
          const buf = Buffer.from(await res.arrayBuffer())
          if (buf.length < 1000) continue
          const ext = (res.headers.get('content-type') || 'image/jpeg').includes('png') ? 'png' : 'jpg'
          const blob = await put(`places/${x.id}/${j}-${Date.now()}.${ext}`, buf, {
            access: 'public', addRandomSuffix: true, contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
          })
          photos.push(blob.url)
        } catch {}
      }
    }
    const about = info?.about || {}
    const row = {
      id: x.id,
      property_token: x.id,
      slug: x.dest.slug,
      province: CANON[x.dest.province] || x.dest.province,
      name: String(x.item?.title || info?.title || '').trim(),
      type: x.dest.hl === 'fr' ? 'chalet' : 'cottage',
      source: 'dataforseo',
      thumbnail: photos[0] || null,
      photos: JSON.stringify(photos),
      lat: x.item?.location?.latitude ?? info?.location?.latitude ?? null,
      lng: x.item?.location?.longitude ?? info?.location?.longitude ?? null,
      price_cad: (x.item?.prices?.price || info?.prices?.price) ? Math.round(x.item?.prices?.price || info?.prices?.price) : null,
      price_before_taxes: x.item?.prices?.price_without_discount ? Math.round(x.item.prices.price_without_discount) : null,
      rating: typeof x.item?.reviews?.value === 'number' && x.item.reviews.value > 0 ? String(Math.round(x.item.reviews.value * 10) / 10) : null,
      reviews: Number(x.item?.reviews?.votes_count || info?.reviews?.votes_count || 0),
      sleeps: null, bedrooms: null, bathrooms: null, sqm: null,
      amenities: JSON.stringify(amenityNames(info)),
      excluded_amenities: JSON.stringify([]),
      check_in_time: clock(about.check_in_time), check_out_time: clock(about.check_out_time),
      google_link: info?.check_url || null,
      affiliate_url: null,
      ota_links: JSON.stringify(links),
      available: true,
      last_synced: dates.check_in,
      image_alt: String(x.item?.title || info?.title || '').trim(),
    }
    perCity.set(x.dest.slug, (perCity.get(x.dest.slug) || 0) + 1)
    perProv.set(row.province, (perProv.get(row.province) || 0) + 1)
    if (WRITE) {
      try {
        const cols = Object.keys(row)
        const vals = cols.map(c => row[c])
        const params = cols.map((_, k) => `$${k + 1}`).join(',')
        const updates = cols.filter(c => !['property_token', 'affiliate_url', 'available'].includes(c)).map(c => `${c} = EXCLUDED.${c}`).join(', ')
        await pool.query(`INSERT INTO affiliatecottages (${cols.join(',')}) VALUES (${params}) ON CONFLICT (property_token) DO UPDATE SET ${updates}, available = true`, vals)
        written++
      } catch (e) { errors++; console.error(`[${x.id}] ${e.message}`) }
    }
    if (kept % 25 === 0) console.log(`  ... enrichis=${enriched} gardés=${kept} écrits=${written} coût=$${cost.toFixed(3)}`)
  }
}
await Promise.all(Array.from({ length: 6 }, enrichWorker))
await pool.end()
console.log('='.repeat(88))
console.log(`TOTAL candidats=${candidates.size} | enrichis=${enriched} | gardés OTA=${kept} | écrits=${written} | erreurs=${errors}`)
console.log(`Coût réel=$${cost.toFixed(3)} | par province=${JSON.stringify([...perProv.entries()].sort())}`)
console.log(`Par ville=${JSON.stringify([...perCity.entries()].sort((a, b) => b[1] - a[1]))}`)
if (!WRITE) console.log('Dry-run : relance avec --write pour écrire.')
