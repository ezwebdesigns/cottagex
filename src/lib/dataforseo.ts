// DataForSEO — source primaire ChaletExpress (Google Hotels, vacation rentals).
// Aucun import `@/` : ce module est importable à la fois par Next et par les
// scripts Node (`node scripts/dfs-chalet-accumulate.mjs`).
import fs from 'fs'
import path from 'path'
export const DESTINATIONS: { slug: string; province: string; query: string; hl?: string }[] = [
  // Ontario — 6
  { slug: 'muskoka',         province: 'ontario',          query: 'muskoka cottage rentals ontario canada' },
  { slug: 'prince-edward',   province: 'ontario',          query: 'prince edward county cottage rentals ontario canada' },
  { slug: 'blue-mountain',   province: 'ontario',          query: 'blue mountain cottage rentals ontario canada' },
  { slug: 'haliburton',      province: 'ontario',          query: 'haliburton highlands cottage rentals ontario canada' },
  { slug: 'georgian-bay',    province: 'ontario',          query: 'georgian bay cottage rentals ontario canada' },
  { slug: 'kawarthas',       province: 'ontario',          query: 'kawartha lakes ontario cottage rentals canada' },

  // Quebec — 6 (FR + EN sur les plus demandees)
  { slug: 'quebec',              province: 'quebec', query: 'chalet a louer quebec',            hl: 'fr' },
  { slug: 'mont-tremblant',      province: 'quebec', query: 'chalet mont tremblant',            hl: 'fr' },
  { slug: 'laurentides',         province: 'quebec', query: 'chalet laurentides',               hl: 'fr' },
  { slug: 'charlevoix',          province: 'quebec', query: 'chalet a louer charlevoix',        hl: 'fr' },
  { slug: 'saguenay-lac-st-jean',province: 'quebec', query: 'chalet a louer saguenay lac st jean', hl: 'fr' },
  { slug: 'saguenay-lac-st-jean',province: 'quebec', query: 'saguenay chalet rental quebec', hl: 'en' },
  { slug: 'quebec',              province: 'quebec', query: 'vacation cottage rental quebec',   hl: 'en' },
  { slug: 'mont-tremblant',      province: 'quebec', query: 'cottage mont tremblant rental',    hl: 'en' },
  { slug: 'laurentides',         province: 'quebec', query: 'cottage laurentians',              hl: 'en' },
  { slug: 'magog',               province: 'quebec', query: 'magog lake memphremagog cottage vrbo quebec', hl: 'en' },

  // Colombie-Britannique — 6
  { slug: 'maple-bay',       province: 'british-columbia', query: 'maple bay cabin rentals bc canada' },
  { slug: 'whistler',        province: 'british-columbia', query: 'whistler cabin rentals bc canada' },
  { slug: 'okanagan',        province: 'british-columbia', query: 'okanagan valley cottage rentals bc canada' },
  { slug: 'tofino',          province: 'british-columbia', query: 'tofino bc cabin rental canada' },
  { slug: 'sunshine-coast',  province: 'british-columbia', query: 'gibsons bc cabin rental vrbo' },
  { slug: 'comox-valley',    province: 'british-columbia', query: 'comox valley cabin rentals bc canada' },

  // Alberta — 6
  { slug: 'pigeon-lake',     province: 'alberta', query: 'pigeon lake cottage alberta canada' },
  { slug: 'crowsnest-pass',  province: 'alberta', query: 'crowsnest pass cabin rentals alberta canada' },
  { slug: 'sylvan-lake',     province: 'alberta', query: 'sylvan lake cottage rentals alberta canada' },
  { slug: 'gull-lake',       province: 'alberta', query: 'gull lake cottage rental alberta canada' },
  { slug: 'gull-lake',       province: 'alberta', query: 'gull lake alberta vacation rental' },
  { slug: 'jasper',          province: 'alberta', query: 'jasper cabin rentals alberta canada' },
  { slug: 'jasper',          province: 'alberta', query: 'jasper vacation rental alberta' },
  { slug: 'banff',           province: 'alberta', query: 'banff cabin rentals alberta canada' },
  { slug: 'banff',           province: 'alberta', query: 'banff vacation rental alberta' },

  // Manitoba — 6
  { slug: 'falcon-lake',     province: 'manitoba', query: 'falcon lake cottage rentals manitoba canada' },
  { slug: 'gimli',           province: 'manitoba', query: 'gimli cottage rental manitoba canada' },
  { slug: 'whiteshell',      province: 'manitoba', query: 'whiteshell provincial park cabin rentals manitoba' },
  { slug: 'lake-winnipeg',   province: 'manitoba', query: 'lake winnipeg cottage rental manitoba canada' },
  { slug: 'winnipeg-beach',  province: 'manitoba', query: 'winnipeg beach cottage rental manitoba canada' },
  { slug: 'clear-lake',      province: 'manitoba', query: 'clear lake cottage rental manitoba canada' },

  // Saskatchewan — 6
  { slug: 'candle-lake',     province: 'saskatchewan', query: 'candle lake cottage rental saskatchewan' },
  { slug: 'meadow-lake',     province: 'saskatchewan', query: 'meadow lake saskatchewan cabin rental' },
  { slug: 'emma-lake',       province: 'saskatchewan', query: 'emma lake cabin rentals saskatchewan' },
  { slug: 'last-mountain',   province: 'saskatchewan', query: 'last mountain lake saskatchewan cottage rental' },
  { slug: 'greenwater-lake', province: 'saskatchewan', query: 'greenwater lake cabin rentals saskatchewan' },
  { slug: 'la-ronge',        province: 'saskatchewan', query: 'la ronge cabin rentals saskatchewan' },
  { slug: 'la-ronge',        province: 'saskatchewan', query: 'la ronge saskatchewan vacation rental' },

  // Nouveau-Brunswick — 6
  { slug: 'shediac',           province: 'new-brunswick', query: 'shediac cottage rentals new brunswick canada' },
  { slug: 'fundy-coast',       province: 'new-brunswick', query: 'bay of fundy cottage rental new brunswick' },
  { slug: 'acadian-peninsula', province: 'new-brunswick', query: 'acadian peninsula cottage rentals new brunswick canada' },
  { slug: 'st-andrews',        province: 'new-brunswick', query: 'st andrews nb cottage rental canada' },
  { slug: 'moncton-nb',        province: 'new-brunswick', query: 'moncton new brunswick cottage rental canada' },
  { slug: 'miramichi',         province: 'new-brunswick', query: 'miramichi cottage rentals new brunswick canada' },

  // Nouvelle-Ecosse — 6
  { slug: 'cape-breton',    province: 'nova-scotia', query: 'cape breton cottage rentals nova scotia canada' },
  { slug: 'south-shore-ns', province: 'nova-scotia', query: 'south shore cottage rentals nova scotia canada' },
  { slug: 'digby',          province: 'nova-scotia', query: 'digby nova scotia cottage rental canada' },
  { slug: 'yarmouth-ns',    province: 'nova-scotia', query: 'yarmouth nova scotia cottage rental canada' },
  { slug: 'lunenburg',      province: 'nova-scotia', query: 'lunenburg nova scotia cottage rentals canada' },
  { slug: 'annapolis-valley',province: 'nova-scotia', query: 'annapolis valley cottage rentals nova scotia' },

  // PEI — 6
  { slug: 'charlottetown',   province: 'pei', query: 'charlottetown pei cottage rental canada' },
  { slug: 'pei-north-shore', province: 'pei', query: 'north shore cottage rentals pei canada' },
  { slug: 'pei-points-east', province: 'pei', query: 'points east cottage rentals pei canada' },
  { slug: 'victoria-pei',    province: 'pei', query: 'victoria pei cottage rental canada' },
  { slug: 'cavendish',       province: 'pei', query: 'cavendish pei cottage rentals canada' },
  { slug: 'summerside',      province: 'pei', query: 'summerside pei cottage rentals canada' },
]

const DFS_BASE = process.env.DATAFORSEO_BASE || 'https://api.dataforseo.com'

export function dataforseoEnabled(): boolean {
  return !!process.env.DATAFORSEO_LOGIN && !!process.env.DATAFORSEO_API_PASSWORD
}

// Les identifiants sont fournis dans .env.local / Vercel. Ce helper permet
// aussi aux scripts locaux de réutiliser le coffre partagé des autres projets
// sans jamais écrire ni afficher les valeurs.
export function loadDfsEnv(extraPaths: string[] = []): void {
  // Construit à l'exécution : un `new URL('../../.env', import.meta.url)` est
  // interprété par Turbopack comme un import de module et casse la build Vercel.
  const root = process.cwd()
  const paths = [
    path.join(root, '.env.local'),
    path.join(root, '.env'),
    ...extraPaths,
  ]
  for (const p of paths) {
    let text = ''
    try { text = fs.readFileSync(p, 'utf8') } catch { continue }
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
      if (!m) continue
      let v = m[2].trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
      if (v && !process.env[m[1]]) process.env[m[1]] = v
    }
  }
}

function headers(): Record<string, string> {
  const cred = Buffer.from(
    `${process.env.DATAFORSEO_LOGIN || ''}:${process.env.DATAFORSEO_API_PASSWORD || ''}`
  ).toString('base64')
  return { 'Content-Type': 'application/json', Authorization: `Basic ${cred}` }
}

async function dfsPost(path: string, task: any): Promise<any | null> {
  try {
    const res = await fetch(`${DFS_BASE}/v3/business_data/google${path}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify([task]),
      signal: AbortSignal.timeout(90000),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = await res.json()
    const t = json?.tasks?.[0]
    if (!t || t.status_code !== 20000) return null
    return t
  } catch {
    return null
  }
}

// Live mode : ~11 s, facturé $0.004 par SERP (18 résultats organiques).
export async function dfHotelSearch(task: {
  keyword: string
  location_name: string
  language_code: string
  check_in: string
  check_out: string
  adults?: number
  is_vacation_rentals?: boolean
  sort_by?: string
  depth?: number
}): Promise<any[]> {
  const t = await dfsPost('/hotel_searches/live', {
    location_name: task.location_name,
    language_code: task.language_code,
    keyword: task.keyword,
    currency: 'CAD',
    check_in: task.check_in,
    check_out: task.check_out,
    adults: task.adults ?? 2,
    is_vacation_rentals: task.is_vacation_rentals ?? true,
    sort_by: task.sort_by ?? 'highest_rating',
    depth: task.depth ?? 18,
  })
  return t?.result?.[0]?.items ?? []
}

// Enrichissement : description, amenities, horaires, téléphone, adresse.
// $0.004 par entité en Live advanced.
export async function dfHotelInfo(hotelIdentifier: string, base: {
  location_name: string
  language_code: string
  check_in: string
  check_out: string
}): Promise<any | null> {
  const t = await dfsPost('/hotel_info/live/advanced', {
    hotel_identifier: hotelIdentifier,
    location_name: base.location_name,
    language_code: base.language_code,
    currency: 'CAD',
    check_in: base.check_in,
    check_out: base.check_out,
    adults: 2,
  })
  return t?.result?.[0] ?? null
}

export function locationName(province: string): string {
  const names: Record<string, string> = {
    ontario: 'Ontario,Canada',
    quebec: 'Quebec,Canada',
    'british-columbia': 'British Columbia,Canada',
    'nova-scotia': 'Nova Scotia,Canada',
    alberta: 'Alberta,Canada',
    manitoba: 'Manitoba,Canada',
    'new-brunswick': 'New Brunswick,Canada',
    pei: 'Prince Edward Island,Canada',
    saskatchewan: 'Saskatchewan,Canada',
  }
  return names[province] || `${province},Canada`
}

export function prettyProvince(province: string): string {
  return province.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// Week-end cible déterministe (vendredi ~45 jours devant nous) pour que les
// prix et la disponibilité restent comparables d'une passe à l'autre.
export function stayDates(today = new Date()): { check_in: string; check_out: string } {
  const d = new Date(today)
  d.setDate(d.getDate() + 45)
  const delta = (5 - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + delta)
  const out = new Date(d)
  out.setDate(out.getDate() + 2)
  return { check_in: d.toISOString().slice(0, 10), check_out: out.toISOString().slice(0, 10) }
}

function amenityNames(info: any): string[] {
  const about = info?.about || {}
  const out: string[] = []
  for (const a of about.popular_amenities || []) {
    if (a?.amenity) out.push(String(a.amenity).replace(/_/g, ' '))
  }
  for (const a of about.amenities || []) {
    if (typeof a === 'string') out.push(a)
    else if (a?.amenity) out.push(String(a.amenity).replace(/_/g, ' '))
  }
  return Array.from(new Set(out)).slice(0, 20)
}

function clock(t: any): string | null {
  if (!t || typeof t.hour !== 'number') return null
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute || 0).padStart(2, '0')}`
}

// Item Hotel Searches + enrichissement Hotel Info -> ligne affiliatecottages.
export function mapHotelToCottage(item: any, info: any, dest: any, dates: any, photos: string[]): any {
  const id = String(item?.hotel_identifier || '')
  const rating = typeof item?.reviews?.value === 'number' && item.reviews.value > 0
    ? String(Math.round(item.reviews.value * 10) / 10)
    : null
  const price = item?.prices?.price || info?.prices?.price || null
  const about = info?.about || {}
  const checkUrl = info?.check_url || null
  return {
    id,
    property_token: id,
    slug: dest.slug,
    province: prettyProvince(dest.province),
    name: String(item?.title || info?.title || '').trim(),
    type: dest.hl === 'fr' ? 'chalet' : 'cottage',
    source: 'dataforseo',
    thumbnail: photos[0] || null,
    photos: JSON.stringify(photos),
    lat: item?.location?.latitude ?? info?.location?.latitude ?? null,
    lng: item?.location?.longitude ?? info?.location?.longitude ?? null,
    price_cad: price ? Math.round(price) : null,
    price_before_taxes: item?.prices?.price_without_discount ? Math.round(item.prices.price_without_discount) : null,
    rating,
    reviews: Number(item?.reviews?.votes_count || info?.reviews?.votes_count || 0),
    sleeps: null,
    bedrooms: null,
    bathrooms: null,
    sqm: null,
    amenities: JSON.stringify(amenityNames(info)),
    excluded_amenities: JSON.stringify([]),
    check_in_time: clock(about.check_in_time),
    check_out_time: clock(about.check_out_time),
    google_link: checkUrl,
    affiliate_url: null,
    available: true,
    last_synced: dates.check_in,
    image_alt: String(item?.title || info?.title || '').trim(),
  }
}
