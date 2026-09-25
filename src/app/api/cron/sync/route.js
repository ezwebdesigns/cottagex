/**
 * /app/api/cron/sync/route.js
 * Cron mensuel — rafraîchit tout le catalogue via SerpApi
 * Planifié via Netlify Scheduled Functions : 1er de chaque mois à 6h UTC
 *
 * Même logique que seed-cottages.mjs mais en route API
 */

import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
// Local Supabase has no SSL; remote DBs require it.
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString || '')
const pool = new Pool({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
})

const ALLOWED_SOURCES = ['Vrbo.com', 'Expedia.com', 'Hotels.com', 'VRBO']
const ALLOWED_DOMAINS = ['vrbo.com', 'expedia.com']

// ─── DESTINATIONS (identique à seed-cottages.mjs) ────────────────────────────

const DESTINATIONS = [
  // Ontario
  { slug: 'muskoka',            province: 'ontario',          query: 'muskoka cottage rentals ontario canada' },
  { slug: 'kawarthas',          province: 'ontario',          query: 'kawartha lakes ontario cottage vrbo' },
  { slug: 'haliburton',         province: 'ontario',          query: 'haliburton highlands cottage rentals ontario canada' },
  { slug: 'georgian-bay',       province: 'ontario',          query: 'georgian bay cottage rentals ontario canada' },
  { slug: 'prince-edward',      province: 'ontario',          query: 'prince edward county cottage rentals ontario canada' },

  // FR — court et précis
  { slug: 'laurentides',    province: 'quebec', query: 'chalet laurentides',    hl: 'fr' },
  { slug: 'mont-tremblant', province: 'quebec', query: 'chalet mont-tremblant', hl: 'fr' },
  { slug: 'quebec',         province: 'quebec', query: 'location chalet à louer', hl: 'fr' },

  // EN — court et précis
  { slug: 'laurentides',    province: 'quebec', query: 'cottage laurentians',          hl: 'en' },
  { slug: 'mont-tremblant', province: 'quebec', query: 'cottage mont-tremblant rental', hl: 'en' },
  { slug: 'quebec',         province: 'quebec', query: 'vacation cottage rental quebec', hl: 'en' },
  { slug: 'quebec-city',    province: 'quebec', query: 'quebec city vacation rental vrbo canada', hl: 'en' },
  { slug: 'orford',         province: 'quebec', query: 'orford estrie chalet rental vrbo quebec', hl: 'en' },
  { slug: 'bromont',        province: 'quebec', query: 'bromont chalet rental vrbo quebec canada', hl: 'en' },
  { slug: 'magog',          province: 'quebec', query: 'magog lake memphremagog cottage vrbo quebec', hl: 'en' },
  { slug: 'saint-sauveur',  province: 'quebec', query: 'saint sauveur chalet rental vrbo laurentians', hl: 'en' },
  { slug: 'ste-adele',      province: 'quebec', query: 'sainte adele chalet rental vrbo laurentians', hl: 'en' },
  { slug: 'morin-heights',  province: 'quebec', query: 'morin heights chalet rental vrbo quebec', hl: 'en' },
  { slug: 'sutton',         province: 'quebec', query: 'sutton quebec chalet rental vrbo canada', hl: 'en' },

  // British Columbia
  { slug: 'whistler',           province: 'british-columbia', query: 'whistler cabin rentals bc canada' },
  { slug: 'okanagan',           province: 'british-columbia', query: 'okanagan valley cottage rentals bc canada' },
  { slug: 'sunshine-coast',     province: 'british-columbia', query: 'gibsons bc cabin rental vrbo' },
  { slug: 'tofino',             province: 'british-columbia', query: 'tofino bc cabin rental canada' },

  // Nova Scotia
  { slug: 'cape-breton',        province: 'nova-scotia',      query: 'cape breton cottage rentals nova scotia canada' },
  { slug: 'south-shore-ns',     province: 'nova-scotia',      query: 'south shore cottage rentals nova scotia canada' },
  { slug: 'digby',              province: 'nova-scotia',      query: 'digby nova scotia cottage rental canada' },
  { slug: 'yarmouth-ns',        province: 'nova-scotia',      query: 'yarmouth nova scotia cottage rental canada' },

  // Alberta
  { slug: 'sylvan-lake',        province: 'alberta',          query: 'sylvan lake cottage rentals alberta canada' },
  { slug: 'pigeon-lake',        province: 'alberta',          query: 'pigeon lake cottage alberta canada' },
  { slug: 'gull-lake-ab',       province: 'alberta',          query: 'gull lake cottage rental alberta canada' },

  // New Brunswick
  { slug: 'acadian-peninsula',  province: 'new-brunswick',    query: 'acadian peninsula cottage rentals new brunswick canada' },
  { slug: 'shediac',            province: 'new-brunswick',    query: 'shediac cottage rentals new brunswick canada' },
  { slug: 'fundy-coast',        province: 'new-brunswick',    query: 'bay of fundy cottage rental new brunswick' },
  { slug: 'st-andrews',         province: 'new-brunswick',    query: 'st andrews nb cottage rental canada' },
  { slug: 'sussex-nb',          province: 'new-brunswick',    query: 'sussex new brunswick cottage rental canada' },
  { slug: 'moncton-nb',         province: 'new-brunswick',    query: 'moncton new brunswick cottage rental canada' },

  // PEI
  { slug: 'pei-north-shore',    province: 'pei',              query: 'north shore cottage rentals pei canada' },
  { slug: 'pei-points-east',    province: 'pei',              query: 'points east cottage rentals pei canada' },
  { slug: 'charlottetown',      province: 'pei',              query: 'charlottetown pei cottage rental canada' },
  { slug: 'victoria-pei',       province: 'pei',              query: 'victoria pei cottage rental canada' },

  // Saskatchewan
  { slug: 'candle-lake',        province: 'saskatchewan',     query: 'candle lake cottage rental saskatchewan' },

  // Manitoba
  { slug: 'falcon-lake',        province: 'manitoba',         query: 'falcon lake cottage rentals manitoba canada' },
  { slug: 'gimli',              province: 'manitoba',         query: 'gimli cottage rental manitoba canada' },
  { slug: 'lake-winnipeg',      province: 'manitoba',         query: 'lake winnipeg cottage rental manitoba canada' },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function nextWeekend() {
  const now = new Date()
  // Choisit aléatoirement une date dans les 12 prochains mois
  const daysAhead = Math.floor(Math.random() * 365) + 7 // entre 7 et 372 jours
  const checkin = new Date(now)
  checkin.setDate(now.getDate() + daysAhead)
  // Ajuste au vendredi le plus proche
  const dayOfWeek = checkin.getDay()
  const daysToFriday = (5 - dayOfWeek + 7) % 7 || 7
  checkin.setDate(checkin.getDate() + daysToFriday)
  const checkout = new Date(checkin)
  checkout.setDate(checkin.getDate() + 2)
  return {
    checkin:  checkin.toISOString().split('T')[0],
    checkout: checkout.toISOString().split('T')[0],
  }
}

function isAllowed(prop, strictLink = true) {
  const hasAllowedSource = prop.prices?.some(price =>
    ALLOWED_SOURCES.some(s => price.source?.includes(s))
  )
  if (!hasAllowedSource) return false
  if (strictLink) {
    return prop.link && ALLOWED_DOMAINS.some(d => prop.link.includes(d))
  }
  return !!prop.link
}

function transform(prop, dest) {
  const allowedPrice  = prop.prices?.find(p => ALLOWED_SOURCES.some(s => p.source?.includes(s)))
  const info          = prop.essential_info || []
  const sleeps        = info.find(i => i.startsWith('Sleeps'))?.match(/\d+/)?.[0]     || null
  const bedrooms      = info.find(i => i.includes('bedroom'))?.match(/\d+/)?.[0]      || null
  const bathrooms     = info.find(i => i.includes('bathroom'))?.match(/\d+/)?.[0]     || null
  const sqm           = info.find(i => i.includes('sq m'))?.match(/[\d,]+/)?.[0]      || null
  const type          = info.find(i => i.startsWith('Entire'))?.replace('Entire ','') || 'cottage'

  return {
    id:                 `${dest.slug}-${prop.property_token}`,
    property_token:     prop.property_token,
    slug:               dest.slug,
    province:           dest.province,
    name:               prop.name,
    type,
    source:             allowedPrice?.source || prop.prices?.[0]?.source || null,
    thumbnail:          prop.images?.[0]?.original_image || null,
    photos:             JSON.stringify((prop.images||[]).map(i => i.original_image).filter(Boolean)),
    lat:                prop.gps_coordinates?.latitude  || null,
    lng:                prop.gps_coordinates?.longitude || null,
    price_cad:          prop.rate_per_night?.extracted_lowest            || null,
    price_before_taxes: prop.rate_per_night?.extracted_before_taxes_fees || null,
    rating:             prop.overall_rating ? Math.round(prop.overall_rating * 10) / 10 : null,
    reviews:            prop.reviews || null,
    sleeps:             sleeps    ? parseInt(sleeps)              : null,
    bedrooms:           bedrooms  ? parseInt(bedrooms)            : null,
    bathrooms:          bathrooms ? parseInt(bathrooms)           : null,
    sqm:                sqm       ? parseInt(sqm.replace(',','')) : null,
    amenities:          JSON.stringify(prop.amenities          || []),
    excluded_amenities: JSON.stringify(prop.excluded_amenities || []),
    check_in_time:      prop.check_in_time  || null,
    check_out_time:     prop.check_out_time || null,
    google_link:        prop.link || null,
    affiliate_url:      null,
  }
}

async function upsert(client, c) {
  await client.query(`
    INSERT INTO affiliatecottages (
      id, property_token, slug, province, name, type, source,
      thumbnail, photos, lat, lng,
      price_cad, price_before_taxes, rating, reviews,
      sleeps, bedrooms, bathrooms, sqm,
      amenities, excluded_amenities,
      check_in_time, check_out_time,
      google_link, affiliate_url,
      available, last_synced
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,
      $8,$9,$10,$11,
      $12,$13,$14,$15,
      $16,$17,$18,$19,
      $20,$21,$22,$23,
      $24,$25,
      true, CURRENT_DATE
    )
    ON CONFLICT (property_token) DO UPDATE SET
      name               = EXCLUDED.name,
      thumbnail          = EXCLUDED.thumbnail,
      photos             = EXCLUDED.photos,
      price_cad          = EXCLUDED.price_cad,
      price_before_taxes = EXCLUDED.price_before_taxes,
      rating             = EXCLUDED.rating,
      reviews            = EXCLUDED.reviews,
      amenities          = EXCLUDED.amenities,
      google_link        = EXCLUDED.google_link,
      available          = true,
      last_synced        = CURRENT_DATE
      -- affiliate_url non touché : préserve tes deep links manuels
  `, [
    c.id, c.property_token, c.slug, c.province, c.name, c.type, c.source,
    c.thumbnail, c.photos, c.lat, c.lng,
    c.price_cad, c.price_before_taxes, c.rating, c.reviews,
    c.sleeps, c.bedrooms, c.bathrooms, c.sqm,
    c.amenities, c.excluded_amenities,
    c.check_in_time, c.check_out_time,
    c.google_link, c.affiliate_url,
  ])
}

// ─── HANDLER ─────────────────────────────────────────────────────────────────

export async function GET(request) {

  // ── Sécurité ───────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { checkin, checkout } = nextWeekend()
  const client = await pool.connect()
  const results = { destinations: 0, fetched: 0, inserted: 0, updated: 0, errors: 0 }

  console.log(`[sync] Démarrage — ${checkin} → ${checkout}`)

  try {
    for (const dest of DESTINATIONS) {
      const strict = dest.strictLink !== false
      try {
        const params = new URLSearchParams({
          engine:           'google_hotels',
          q:                dest.query,
          gl:               'ca',
          hl:               dest.hl || 'en',
          currency:         'CAD',
          check_in_date:    checkin,
          check_out_date:   checkout,
          adults:           '2',
          vacation_rentals: 'true',
          property_types:   '4,5',
          sort_by:          '8',
          api_key:          process.env.SERPAPI_KEY,
        })

        const res = await fetch(`https://serpapi.com/search.json?${params}`)
        if (!res.ok) throw new Error(`SerpApi HTTP ${res.status}`)
        const data = await res.json()
        if (data.error) throw new Error(data.error)

        const properties = data.properties || []
        const filtered   = properties.filter(p => isAllowed(p, strict))
        results.fetched += filtered.length

        for (const prop of filtered) {
          const cottage = transform(prop, dest)
          const { rows } = await client.query(
            'SELECT id FROM affiliatecottages WHERE property_token = $1',
            [cottage.property_token]
          )
          await upsert(client, cottage)
          rows.length === 0 ? results.inserted++ : results.updated++
        }

        results.destinations++
        console.log(`[sync] ${dest.slug.padEnd(22)} → ${filtered.length} valides`)
        await new Promise(r => setTimeout(r, 1200))

      } catch (err) {
        results.errors++
        console.error(`[sync] ${dest.slug} erreur: ${err.message}`)
      }
    }
  } finally {
    client.release()
  }

  console.log(`[sync] Terminé — ${JSON.stringify(results)}`)

  // Catalogue changed → drop cached cottage queries (best-effort).
  try {
    const { invalidateCottages } = await import('@/lib/cache')
    await invalidateCottages()
  } catch {}

  // Cache warming: pre-populate cache for all destination slugs.
  try {
    const { getCottages } = await import('@/lib/cottages')
    const DESTINATION_SLUGS = DESTINATIONS.map(d => d.slug)
    console.log(`[sync] Warming cache for ${DESTINATION_SLUGS.length} destinations...`)
    
    for (const slug of DESTINATION_SLUGS) {
      try {
        // Warm cache for province-based destinations
        const dest = DESTINATIONS.find(d => d.slug === slug)
        if (dest) {
          await getCottages({
            province: dest.province,
            limit: 24,
            sort: 'rating',
            categories: [],
          })
        } else {
          // Fallback for slug-based destinations
          await getCottages({
            slug,
            limit: 24,
            sort: 'rating',
            categories: [],
          })
        }
      } catch (e) {
        console.warn(`[sync] Cache warm failed for ${slug}:`, e.message)
      }
    }
    console.log(`[sync] Cache warming completed`)
  } catch (e) {
    console.warn('[sync] Cache warming failed:', e.message)
  }

  return Response.json({
    success: true,
    timestamp: new Date().toISOString(),
    checkin,
    checkout,
    ...results,
  })
}
