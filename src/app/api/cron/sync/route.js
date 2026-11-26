/**
 * /app/api/cron/sync/route.js
 * Cron mensuel — rafraîchit tout le catalogue via DataForSEO (Google Hotels)
 * Planifié via Netlify Scheduled Functions : 1er de chaque mois à 6h UTC
 *
 * Même logique que seed-cottages.mjs mais en route API
 */

import { Pool } from 'pg'
import { put } from '@vercel/blob'
import { DESTINATIONS } from '@/lib/chalet-destinations'
import { dfHotelSearch, dfHotelInfo, mapHotelToCottage, locationName, stayDates } from '@/lib/dataforseo'

const connectionString = process.env.DATABASE_URL
// Local Supabase has no SSL; remote DBs require it.
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString || '')
const pool = new Pool({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
})


function isAllowed(item) {
  return !!(item?.hotel_identifier && item?.title)
}

async function toCottage(item, dest, dates) {
  const info = await dfHotelInfo(item.hotel_identifier, {
    location_name: locationName(dest.province),
    language_code: dest.hl || 'en',
    ...dates,
  })
  const urls = (item?.overview_images || info?.overview_images || []).slice(0, 6)
  const photos = []
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    if (!/^https?:\/\//i.test(url)) continue
    if (/\.supabase\.co\/|\.public\.blob\.vercel-storage\.com\//i.test(url)) { photos.push(url); continue }
    try {
      if (!process.env.BLOB_READ_WRITE_TOKEN) { photos.push(url); continue }
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
      if (!res.ok) continue
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 1000) continue
      const ext = (res.headers.get('content-type') || '').includes('png') ? 'png' : 'jpg'
      const blob = await put(`places/${item.hotel_identifier}/${i}-${Date.now()}.${ext}`, buf, {
        access: 'public', addRandomSuffix: true,
        contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
      })
      photos.push(blob.url)
    } catch { /* photo best-effort : la fiche reste servie sans */ }
  }
  return mapHotelToCottage(item, info || null, dest, dates, photos)
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
      ping_status       = 0,
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

  const dates = stayDates()
  const { check_in: checkin, check_out: checkout } = dates
  const dryRun = new URL(request.url).searchParams.get('dry-run') === '1'
  const client = await pool.connect()
  const results = { destinations: 0, fetched: 0, inserted: 0, updated: 0, errors: 0, missed: 0, purged: 0 }
  const seenTokens = new Set()
  const okSlugs = new Set()

  console.log(`[sync] Démarrage — ${checkin} → ${checkout}${dryRun ? ' (DRY-RUN, aucune écriture)' : ''}`)

  try {
    for (const dest of DESTINATIONS) {
      try {
        const items = await dfHotelSearch({
          keyword: dest.query,
          location_name: locationName(dest.province),
          language_code: dest.hl || 'en',
          ...dates,
        })

        const filtered = items.filter(isAllowed)
        results.fetched += filtered.length

        for (const prop of filtered) {
          const cottage = await toCottage(prop, dest, dates)
          seenTokens.add(cottage.property_token)
          if (dryRun) { results.updated++; continue }
          const { rows } = await client.query(
            'SELECT id FROM affiliatecottages WHERE property_token = $1',
            [cottage.property_token]
          )
          await upsert(client, cottage)
          if (rows.length === 0) results.inserted++; else results.updated++;
        }

        okSlugs.add(dest.slug)
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

  // ── Purge automatique ──────────────────────────────────────────────────
  // Les tokens DB non revus ce mois-ci (destinations fetchées OK uniquement)
  // gagnent +1 ping_status ; à 3 absences consécutives → available = false.
  // Jamais de DELETE : affiliate_url et travail manuel préservés.
  let purgedTokens = []
  if (!dryRun) {
    try {
      const { rows: dbRows } = await pool.query(
        'SELECT property_token, slug, ping_status FROM affiliatecottages'
      )
      const missing = dbRows
        .filter(r => !seenTokens.has(r.property_token) && okSlugs.has(r.slug))
        .map(r => r.property_token)
      results.missed = missing.length
      if (missing.length > 0) {
        await pool.query(
          'UPDATE affiliatecottages SET ping_status = ping_status + 1 WHERE property_token = ANY($1)',
          [missing]
        )
      }
      const { rows: purged } = await pool.query(
        `UPDATE affiliatecottages SET available = false
         WHERE ping_status >= 3 AND available = true
         RETURNING property_token`
      )
      results.purged = purged.length
      purgedTokens = purged.map(r => r.property_token)
      console.log(`[sync] Purge — ${missing.length} absents, ${purged.length} désactivés`)
    } catch (err) {
      console.error(`[sync] Purge erreur: ${err.message}`)
    }
  } else {
    const { rows: dbRows } = await pool.query(
      'SELECT property_token, slug, ping_status FROM affiliatecottages'
    )
    const missing = dbRows.filter(r => !seenTokens.has(r.property_token) && okSlugs.has(r.slug))
    results.missed = missing.length
    purgedTokens = missing.filter(r => (r.ping_status + 1) >= 3).map(r => r.property_token)
    results.purged = purgedTokens.length
    console.log(`[sync] DRY-RUN — ${missing.length} absents, ${purgedTokens.length} seraient désactivés`)
  }

  console.log(`[sync] Terminé — ${JSON.stringify(results)}`)

  // Catalogue changed → drop cached cottage queries (best-effort).
  // Dry-run : aucune écriture, rien à invalider ni à réchauffer.
  if (!dryRun) {
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
  } // ← fin du bloc !dryRun

  return Response.json({
    success: true,
    dryRun,
    timestamp: new Date().toISOString(),
    checkin,
    checkout,
    purgedTokens: purgedTokens.slice(0, 50),
    ...results,
  })
}
