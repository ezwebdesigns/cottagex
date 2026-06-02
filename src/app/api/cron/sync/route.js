/**
 * /app/api/cron/sync/route.js
 * Cron mensuel — rafraîchit tout le catalogue via SerpApi
 * Planifié via vercel.json : 1er de chaque mois à 6h UTC
 *
 * Même logique que seed-cottages.mjs mais en route API Vercel
 */

import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const ALLOWED_SOURCES = ['Vrbo.com', 'Expedia.com', 'Hotels.com', 'VRBO']
const ALLOWED_DOMAINS = ['vrbo.com', 'expedia.com']

// ─── DESTINATIONS (identique à seed-cottages.mjs) ────────────────────────────

const DESTINATIONS = [
  { slug: 'muskoka',           province: 'ontario',          query: 'muskoka cottage rentals ontario canada',                      strictLink: false },
  { slug: 'kawarthas',         province: 'ontario',          query: 'kawarthas cottage rentals ontario canada' },
  { slug: 'haliburton',        province: 'ontario',          query: 'haliburton highlands cottage rentals ontario canada' },
  { slug: 'georgian-bay',      province: 'ontario',          query: 'georgian bay cottage rentals ontario canada',                  strictLink: false },
  { slug: 'prince-edward',     province: 'ontario',          query: 'prince edward county cottage rentals ontario canada' },
  // Québec — FR
  { slug: 'laurentides',    province: 'quebec', query: 'chalet laurentides',             hl: 'fr', strictLink: false },
  { slug: 'mont-tremblant', province: 'quebec', query: 'chalet mont-tremblant',           hl: 'fr', strictLink: false },
  { slug: 'tremblant',      province: 'quebec', query: 'chalet tremblant',                hl: 'fr', strictLink: false },
  { slug: 'quebec',         province: 'quebec', query: 'location chalet à louer',         hl: 'fr', strictLink: false },
  // Québec — EN
  { slug: 'laurentides',    province: 'quebec', query: 'cottage laurentians',             hl: 'en', strictLink: false },
  { slug: 'mont-tremblant', province: 'quebec', query: 'cottage mont-tremblant rental',   hl: 'en', strictLink: false },
  { slug: 'tremblant',      province: 'quebec', query: 'cabin tremblant cottage rental',  hl: 'en', strictLink: false },
  { slug: 'quebec',         province: 'quebec', query: 'vacation cottage rental quebec',  hl: 'en', strictLink: false },
  { slug: 'eastern-townships', province: 'quebec', query: 'eastern townships cottage rentals quebec canada', strictLink: false },
  { slug: 'whistler',          province: 'british-columbia', query: 'whistler cabin rentals bc canada' },
  { slug: 'okanagan',          province: 'british-columbia', query: 'okanagan valley cottage rentals bc canada' },
  { slug: 'sunshine-coast',    province: 'british-columbia', query: 'sunshine coast cottage rentals bc canada' },
  { slug: 'cape-breton',       province: 'nova-scotia',      query: 'cape breton cottage rentals nova scotia canada' },
  { slug: 'south-shore-ns',    province: 'nova-scotia',      query: 'south shore cottage rentals nova scotia canada' },
  { slug: 'canmore',           province: 'alberta',          query: 'canmore kananaskis cabin rentals alberta canada' },
  { slug: 'sylvan-lake',       province: 'alberta',          query: 'sylvan lake cottage rentals alberta canada' },
  { slug: 'acadian-peninsula', province: 'new-brunswick',    query: 'acadian peninsula cottage rentals new brunswick canada' },
  { slug: 'shediac',           province: 'new-brunswick',    query: 'shediac cottage rentals new brunswick canada' },
  { slug: 'pei-north-shore',   province: 'pei',              query: 'north shore cottage rentals pei canada' },
  { slug: 'pei-points-east',   province: 'pei',              query: 'points east cottage rentals pei canada' },
  { slug: 'waskesiu',          province: 'saskatchewan',     query: 'prince albert national park cabin rentals saskatchewan canada', strictLink: false },
  { slug: 'falcon-lake',       province: 'manitoba',         query: 'falcon lake cottage rentals manitoba canada',                 strictLink: false },
  { slug: 'west-hawk-lake',    province: 'manitoba',         query: 'west hawk lake cottage rentals manitoba canada',              strictLink: false },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function nextWeekend() {
  const now = new Date()
  const day = now.getDay()
  const daysToFriday = (5 - day + 7) % 7 || 7
  const checkin = new Date(now)
  checkin.setDate(now.getDate() + daysToFriday)
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

  return Response.json({
    success: true,
    timestamp: new Date().toISOString(),
    checkin,
    checkout,
    ...results,
  })
}
