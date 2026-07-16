/**
 * seed-cottages.mjs
 * Constitue le catalogue dans Supabase (table: affiliatecottages)
 *
 * Usage:
 *   node --env-file=.env scripts/seed-cottages.mjs
 *   node --env-file=.env scripts/seed-cottages.mjs muskoka georgian-bay
 *
 * Filtres :
 *   - strictLink: true  → source VRBO/Expedia ET google_link vrbo.com/expedia.com
 *   - (défaut pour toutes les destinations incluant le Québec)
 */

import fetch from 'node-fetch'
import pkg from 'pg'
const { Pool } = pkg

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const SERPAPI_KEY     = process.env.SERPAPI_KEY  || 'REMPLACE_PAR_TA_CLE'
const DATABASE_URL    = process.env.DATABASE_URL || 'REMPLACE_PAR_TON_URL_SUPABASE'
const ALLOWED_SOURCES = ['Vrbo.com', 'Expedia.com', 'Hotels.com', 'VRBO']
const ALLOWED_DOMAINS = ['vrbo.com', 'expedia.com']

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function nextWeekend() {
  return {
    checkin:  '2026-08-07',
    checkout: '2026-08-09',
  }
}

// Double filtre strict : source VRBO/Expedia ET google_link vrbo.com/expedia.com
function isAllowed(prop) {
  const hasAllowedSource = prop.prices?.some(price =>
    ALLOWED_SOURCES.some(s => price.source?.includes(s))
  )
  const hasAllowedLink =
    prop.link && ALLOWED_DOMAINS.some(d => prop.link.includes(d))
  return hasAllowedSource && hasAllowedLink
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
    google_link:        prop.link,
    affiliate_url:      null,
  }
}

// ─── DESTINATIONS ────────────────────────────────────────────────────────────

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

  // British Columbia
  { slug: 'whistler',           province: 'british-columbia', query: 'whistler cabin rentals bc canada' },
  { slug: 'okanagan',           province: 'british-columbia', query: 'okanagan valley cottage rentals bc canada' },
  { slug: 'sunshine-coast',     province: 'british-columbia', query: 'gibsons bc cabin rental vrbo' },

  // Nova Scotia
  { slug: 'cape-breton',        province: 'nova-scotia',      query: 'cape breton cottage rentals nova scotia canada' },
  { slug: 'south-shore-ns',     province: 'nova-scotia',      query: 'south shore cottage rentals nova scotia canada' },

  // Alberta
  { slug: 'sylvan-lake',        province: 'alberta',          query: 'sylvan lake cottage rentals alberta canada' },

  // New Brunswick
  { slug: 'acadian-peninsula',  province: 'new-brunswick',    query: 'acadian peninsula cottage rentals new brunswick canada' },
  { slug: 'shediac',            province: 'new-brunswick',    query: 'shediac cottage rentals new brunswick canada' },

  // PEI
  { slug: 'pei-north-shore',    province: 'pei',              query: 'north shore cottage rentals pei canada' },
  { slug: 'pei-points-east',    province: 'pei',              query: 'points east cottage rentals pei canada' },

  // Saskatchewan
  { slug: 'waskesiu',           province: 'saskatchewan',     query: 'prince albert national park cabin rentals saskatchewan canada' },

  // Manitoba
  { slug: 'falcon-lake',        province: 'manitoba',         query: 'falcon lake cottage rentals manitoba canada' },
  { slug: 'west-hawk-lake',     province: 'manitoba',         query: 'whiteshell provincial park cabin rental manitoba' },
]

// ─── SERPAPI ─────────────────────────────────────────────────────────────────

async function fetchDestination(dest, checkin, checkout) {
  const params = new URLSearchParams({
    engine:           'google_hotels',
    q:                dest.query,
    gl:               'ca',
    hl:               dest.hl || 'en',   // ← utilise hl de la destination
    currency:         'CAD',
    check_in_date:    checkin,
    check_out_date:   checkout,
    adults:           '2',
    vacation_rentals: 'true',
    property_types:   '4,5',
    sort_by:          '8',
    api_key:          SERPAPI_KEY,
  })
  const res = await fetch(`https://serpapi.com/search.json?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.properties || []
}

// ─── UPSERT ──────────────────────────────────────────────────────────────────

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

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function seed() {
  const { checkin, checkout } = nextWeekend()
  const client = await pool.connect()

  // Slugs ciblés via arguments
  const targetSlugs = process.argv.slice(2)
  const destinations = targetSlugs.length > 0
    ? DESTINATIONS.filter(d => targetSlugs.includes(d.slug))
    : DESTINATIONS

  console.log(`\n🏕️  Canada Cottage Rentals — Seed`)
  console.log(`📅  Dates        : ${checkin} → ${checkout}`)
  console.log(`🗄️  Base          : Supabase PostgreSQL`)
  console.log(`🔍  Filtres      : VRBO/Expedia strict (source + google_link)`)
  console.log(`🇨🇦  Mode         : ${targetSlugs.length > 0 ? 'ciblé → ' + targetSlugs.join(', ') : 'complet'}`)
  console.log(`📍  Destinations : ${destinations.length}\n`)

  let totalFetched = 0, totalKept = 0, totalInserted = 0, totalUpdated = 0, searchesUsed = 0

  try {
    for (const dest of destinations) {
      process.stdout.write(`  ⏳ ${dest.slug.padEnd(24)}`)
      try {
        const properties = await fetchDestination(dest, checkin, checkout)
        searchesUsed++
        totalFetched += properties.length

        const filtered = properties.filter(isAllowed)
        totalKept += filtered.length

        let inserted = 0, updated = 0
        for (const prop of filtered) {
          const cottage = transform(prop, dest)
          const { rows } = await client.query(
            'SELECT id FROM affiliatecottages WHERE property_token = $1',
            [cottage.property_token]
          )
          await upsert(client, cottage)
          rows.length === 0 ? inserted++ : updated++
        }

        totalInserted += inserted
        totalUpdated  += updated
        console.log(`✓  ${properties.length} trouvés → ${filtered.length} valides (${inserted} new, ${updated} updated)`)
        await new Promise(r => setTimeout(r, 1200))

      } catch (err) {
        console.log(`✗  ${err.message}`)
      }
    }
  } finally {
    client.release()
    await pool.end()
  }

  console.log(`\n${'─'.repeat(54)}`)
  console.log(`✅  Seed terminé`)
  console.log(`   Searches SerpApi  : ${searchesUsed} / 250`)
  console.log(`   Propriétés vues   : ${totalFetched}`)
  console.log(`   Filtrées valides  : ${totalKept}`)
  console.log(`   Nouvelles         : ${totalInserted}`)
  console.log(`   Mises à jour      : ${totalUpdated}`)
  console.log(`\n⚠️  Prochaines étapes :`)
  console.log(`   1. Vérifie : SELECT * FROM v_destination_stats;`)
  console.log(`   2. Remplis affiliate_url depuis ton dashboard VRBO/Expedia`)
  console.log(`   3. Marque is_featured = true pour les chalets à afficher`)
  console.log()
}

seed().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
