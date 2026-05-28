/**
 * seed.js
 * Constitue le catalogue initial dans Neon (table: affiliatecottages)
 *
 * Usage:
 *   SERPAPI_KEY=xxx DATABASE_URL=xxx node seed.js
 *
 * Prérequis:
 *   npm install node-fetch pg
 *
 * Ce script:
 *   1. Appelle SerpApi pour chaque destination
 *   2. Filtre sur VRBO et Expedia uniquement
 *   3. Insère dans Neon via UPSERT (safe à relancer)
 *   4. Affiche un résumé final
 */

import fetch from 'node-fetch'
import pkg from 'pg'
const { Pool } = pkg

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const SERPAPI_KEY  = process.env.SERPAPI_KEY  || 'c623b4d89875beec441178f238655fd40ae91bfff1b6d8caef151e3cc1efd9c7'
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Yq5DfVIswFB9@ep-morning-frog-apofbubd-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const ALLOWED_SOURCES = ['Vrbo.com', 'Expedia.com', 'Hotels.com', 'VRBO']

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

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

// ─── DESTINATIONS ────────────────────────────────────────────────────────────

const DESTINATIONS = [
  { slug: 'muskoka',            province: 'ontario',          query: 'muskoka cottage rentals ontario canada' },
  { slug: 'kawarthas',          province: 'ontario',          query: 'kawarthas cottage rentals ontario canada' },
  { slug: 'haliburton',         province: 'ontario',          query: 'haliburton highlands cottage rentals ontario canada' },
  { slug: 'georgian-bay',       province: 'ontario',          query: 'georgian bay cottage rentals ontario canada' },
  { slug: 'prince-edward',      province: 'ontario',          query: 'prince edward county cottage rentals ontario canada' },
  { slug: 'laurentians',        province: 'quebec',           query: 'laurentians chalet rentals quebec canada' },
  { slug: 'eastern-townships',  province: 'quebec',           query: 'eastern townships cottage rentals quebec canada' },
  { slug: 'whistler',           province: 'british-columbia', query: 'whistler cabin rentals bc canada' },
  { slug: 'okanagan',           province: 'british-columbia', query: 'okanagan valley cottage rentals bc canada' },
  { slug: 'sunshine-coast',     province: 'british-columbia', query: 'sunshine coast cottage rentals bc canada' },
  { slug: 'cape-breton',        province: 'nova-scotia',      query: 'cape breton cottage rentals nova scotia canada' },
  { slug: 'south-shore-ns',     province: 'nova-scotia',      query: 'south shore cottage rentals nova scotia canada' },
  { slug: 'canmore',            province: 'alberta',          query: 'canmore kananaskis cabin rentals alberta canada' },
  { slug: 'sylvan-lake',        province: 'alberta',          query: 'sylvan lake cottage rentals alberta canada' },
  { slug: 'acadian-peninsula',  province: 'new-brunswick',    query: 'acadian peninsula cottage rentals new brunswick canada' },
  { slug: 'shediac',            province: 'new-brunswick',    query: 'shediac cottage rentals new brunswick canada' },
  { slug: 'pei-north-shore',    province: 'pei',              query: 'north shore cottage rentals pei canada' },
  { slug: 'pei-points-east',    province: 'pei',              query: 'points east cottage rentals pei canada' },
  { slug: 'waskesiu',           province: 'saskatchewan',     query: 'waskesiu lake cottage rentals saskatchewan canada' },
  { slug: 'falcon-lake',        province: 'manitoba',         query: 'falcon lake cottage rentals manitoba canada' },
  { slug: 'west-hawk-lake',     province: 'manitoba',         query: 'west hawk lake cottage rentals manitoba canada' },
]

// ─── SERPAPI ─────────────────────────────────────────────────────────────────

async function fetchDestination(dest, checkin, checkout) {
  const params = new URLSearchParams({
    engine:           'google_hotels',
    q:                dest.query,
    gl:               'ca',
    hl:               'en',
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

// ─── TRANSFORM ───────────────────────────────────────────────────────────────

function transform(prop, dest) {
  const allowedPrice = prop.prices?.find(p =>
    ALLOWED_SOURCES.some(s => p.source?.includes(s))
  )
  const info      = prop.essential_info || []
  const sleeps    = info.find(i => i.startsWith('Sleeps'))?.match(/\d+/)?.[0]    || null
  const bedrooms  = info.find(i => i.includes('bedroom'))?.match(/\d+/)?.[0]     || null
  const bathrooms = info.find(i => i.includes('bathroom'))?.match(/\d+/)?.[0]    || null
  const sqm       = info.find(i => i.includes('sq m'))?.match(/[\d,]+/)?.[0]     || null
  const type      = info.find(i => i.startsWith('Entire'))?.replace('Entire ','') || 'cottage'

  return {
    id:                 `${dest.slug}-${prop.property_token}`,
    property_token:     prop.property_token,
    slug:               dest.slug,
    province:           dest.province,
    name:               prop.name,
    type,
    source:             allowedPrice?.source || prop.prices?.[0]?.source || null,
    thumbnail:          prop.images?.[0]?.original_image || null,
    photos:             JSON.stringify((prop.images||[]).map(i=>i.original_image).filter(Boolean)),
    lat:                prop.gps_coordinates?.latitude  || null,
    lng:                prop.gps_coordinates?.longitude || null,
    price_cad:          prop.rate_per_night?.extracted_lowest            || null,
    price_before_taxes: prop.rate_per_night?.extracted_before_taxes_fees || null,
    rating:             prop.overall_rating ? Math.round(prop.overall_rating*10)/10 : null,
    reviews:            prop.reviews || null,
    sleeps:             sleeps    ? parseInt(sleeps)              : null,
    bedrooms:           bedrooms  ? parseInt(bedrooms)            : null,
    bathrooms:          bathrooms ? parseInt(bathrooms)           : null,
    sqm:                sqm       ? parseInt(sqm.replace(',','')) : null,
    amenities:          JSON.stringify(prop.amenities          || []),
    excluded_amenities: JSON.stringify(prop.excluded_amenities || []),
    check_in_time:      prop.check_in_time  || null,
    check_out_time:     prop.check_out_time || null,
    google_link:        prop.link           || null,
    affiliate_url:      null,
  }
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

  console.log(`\n🏕️  Canada Cottage Rentals — Seed`)
  console.log(`📅  Dates        : ${checkin} → ${checkout}`)
  console.log(`🗄️  Base          : Neon PostgreSQL`)
  console.log(`📍  Destinations : ${DESTINATIONS.length}\n`)

  let totalFetched = 0, totalInserted = 0, totalUpdated = 0, searchesUsed = 0

  try {
    for (const dest of DESTINATIONS) {
      process.stdout.write(`  ⏳ ${dest.slug.padEnd(24)}`)
      try {
        const properties = await fetchDestination(dest, checkin, checkout)
        searchesUsed++
        totalFetched += properties.length

        const filtered = properties.filter(p =>
          p.prices?.some(price => ALLOWED_SOURCES.some(s => price.source?.includes(s)))
        )

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
        console.log(`✓  ${properties.length} trouvés → ${filtered.length} VRBO/Expedia (${inserted} new, ${updated} updated)`)
        await new Promise(r => setTimeout(r, 1200))

      } catch (err) {
        console.log(`✗  ${err.message}`)
      }
    }
  } finally {
    client.release()
    await pool.end()
  }

  console.log(`\n${'─'.repeat(52)}`)
  console.log(`✅  Seed terminé`)
  console.log(`   Searches SerpApi  : ${searchesUsed} / 250`)
  console.log(`   Trouvées          : ${totalFetched}`)
  console.log(`   Nouvelles         : ${totalInserted}`)
  console.log(`   Mises à jour      : ${totalUpdated}`)
  console.log(`\n⚠️  Prochaines étapes :`)
  console.log(`   1. Vérifie les données dans Neon`)
  console.log(`   2. Remplis affiliate_url depuis ton dashboard VRBO :`)
  console.log(`      SELECT id, slug, name, google_link`)
  console.log(`      FROM affiliatecottages`)
  console.log(`      WHERE affiliate_url IS NULL;`)
  console.log(`   3. Marque les cottages à afficher sur le site :`)
  console.log(`      UPDATE affiliatecottages SET is_featured = true`)
  console.log(`      WHERE id IN ('muskoka-xxx', 'kawarthas-yyy', ...);`)
  console.log()
}

seed().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
