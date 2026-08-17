/**
 * lib/cottages.js
 * Requêtes Supabase pour les cottages avec filtres et tri
 *
 * Usage:
 *   import { getCottages } from '@/lib/cottages'
 *   const cottages = await getCottages({ slug: 'muskoka', limit: 3 })
 */

import { Pool } from 'pg'

let pool = null
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  }
  return pool
}

/**
 * Catégories disponibles et leurs conditions SQL
 * Basées sur les champs amenities (JSONB) et price_cad/rating
 */
const CATEGORY_CONDITIONS = {
  // --- 5 catégories de base ---
  family:        `amenities @> '["Kid-friendly"]'`,
  hotTub:        `(amenities @> '["Hot tub"]' OR amenities @> '["Bain à remous"]' OR amenities @> '["Spa"]')`,
  'hot-tub':     `(amenities @> '["Hot tub"]' OR amenities @> '["Bain à remous"]' OR amenities @> '["Spa"]')`,
  lakefront:     `(amenities @> '["Waterfront"]' OR amenities @> '["Beach access"]' OR amenities @> '["Accès à la plage"]' OR name ILIKE '%waterfront%' OR name ILIKE '%lakefront%' OR name ILIKE '%lake front%' OR name ILIKE '%beach access%' OR name ILIKE '%lakeside%' OR name ILIKE '%beachfront%' OR name ILIKE '%on the lake%' OR name ILIKE '%lake view%')`,
  luxury:        `(rating >= 4.8 AND price_cad >= 600)`,
  'pet-friendly':`(amenities @> '["Pet-friendly"]' OR amenities @> '["Accepte les animaux"]')`,
  all:           null,

  // --- 12 catégories complémentaires ---
  mountain:      `(name ILIKE '%mountain%' OR name ILIKE '%alpine%' OR name ILIKE '%chalet%' OR name ILIKE '%ski%' OR name ILIKE '%peaks%')`,
  romantic:      `(amenities @> '["Fireplace"]' OR amenities @> '["Cheminée"]' OR amenities @> '["Hot tub"]' OR amenities @> '["Bain à remous"]' OR name ILIKE '%cozy%' OR name ILIKE '%romantic%')`,
  'log-cabin':   `(name ILIKE '%log%' OR name ILIKE '%cabin%' OR name ILIKE '%wooden%' OR name ILIKE '%timber%' OR name ILIKE '%chalet%')`,
  countryside:   `(name ILIKE '%country%' OR name ILIKE '%farm%' OR name ILIKE '%acreage%' OR name ILIKE '%ranch%' OR name ILIKE '%valley%' OR name ILIKE '%meadow%')`,
  secluded:      `(name ILIKE '%secluded%' OR name ILIKE '%private%' OR name ILIKE '%quiet%' OR name ILIKE '%retreat%' OR name ILIKE '%peaceful%' OR name ILIKE '%hideaway%')`,
  beach:         `(amenities @> '["Beach access"]' OR amenities @> '["Accès à la plage"]' OR name ILIKE '%beach%' OR name ILIKE '%shore%' OR name ILIKE '%coast%' OR name ILIKE '%seaside%')`,
  resort:        `(name ILIKE '%resort%' OR name ILIKE '%village%' OR amenities @> '["Fitness center"]' OR amenities @> '["Centre de remise en forme"]' OR amenities @> '["Pool"]' OR amenities @> '["Piscine intérieure"]' OR amenities @> '["Piscine extérieure"]')`,
  skiing:        `(name ILIKE '%ski%' OR name ILIKE '%snow%' OR name ILIKE '%winter%' OR name ILIKE '%gondola%' OR name ILIKE '%slope%')`,
  pools:         `(amenities @> '["Pool"]' OR amenities @> '["Piscine intérieure"]' OR amenities @> '["Piscine extérieure"]' OR amenities @> '["Pool intérieur"]' OR name ILIKE '%pool%' OR name ILIKE '%piscine%')`,
  hiking:        `(name ILIKE '%trail%' OR name ILIKE '%hiking%' OR name ILIKE '%park%' OR name ILIKE '%forest%' OR name ILIKE '%wilderness%' OR name ILIKE '%algonquin%')`,
  coastal:       `(name ILIKE '%ocean%' OR name ILIKE '%coast%' OR name ILIKE '%harbour%' OR name ILIKE '%harbor%' OR name ILIKE '%bay%' OR name ILIKE '%sea%' OR name ILIKE '%island%' OR name ILIKE '%marina%' OR name ILIKE '%waterfront%')`,
  waterfront:    `(amenities @> '["Waterfront"]' OR amenities @> '["Beach access"]' OR amenities @> '["Accès à la plage"]' OR name ILIKE '%waterfront%' OR name ILIKE '%lakefront%' OR name ILIKE '%lake front%' OR name ILIKE '%lakeside%' OR name ILIKE '%beachfront%' OR name ILIKE '%oceanfront%' OR name ILIKE '%on the water%' OR name ILIKE '%sea view%')`,
}

/**
 * getCottages — requête principale
 *
 * @param {object}  [opts]
 * @param {string}  [opts.slug]       - destination slug (ex: 'muskoka')
 * @param {string}  [opts.province]   - province slug (ex: 'ontario')
 * @param {number}  [opts.limit]      - nombre de résultats (défaut: 3)
 * @param {string}  [opts.sort]       - 'rating' | 'price' | 'newest' (défaut: 'rating')
 * @param {string[]}[opts.categories] - ['family','hotTub','lakefront','luxury']
 * @param {boolean} [opts.featuredOnly] - seulement is_featured = true (défaut: true — les chalets standard ne sont jamais affichés sur le frontend)
 * @param {boolean} [opts.affiliateOnly] - seulement ceux avec affiliate_url (défaut: false)
 * @returns {Promise<Array>}
 */
export async function getCottages({
  slug        = null,
  province    = null,
  limit       = 3,
  sort        = 'rating',
  categories  = [],
  featuredOnly = true,
  affiliateOnly = false,
} = {}) {

  const conditions = ['is_hidden = false']
  conditions.push('available = true')
  const params     = []
  let   paramIndex = 1

  // Filtre affiliate_url (gallery uniquement)
  if (affiliateOnly) {
    conditions.push(`affiliate_url IS NOT NULL`)
  }

  // Filtre destination
  if (slug && slug !== 'canada') {
    conditions.push(`slug = $${paramIndex++}`)
    params.push(slug)
  } else if (province) {
    conditions.push(`province = $${paramIndex++}`)
    params.push(province)
  }

  // Filtre featured
  if (featuredOnly) {
    conditions.push(`is_featured = true`)
  }

  // Filtres catégories
  for (const cat of categories) {
    if (CATEGORY_CONDITIONS[cat]) {
      conditions.push(CATEGORY_CONDITIONS[cat])
    }
  }

  // Tri
  const orderBy = sort === 'price'
    ? 'price_cad ASC NULLS LAST'
    : sort === 'newest'
      ? 'created_at DESC NULLS LAST'
      : 'rating DESC NULLS LAST'

  // Limite
  conditions.push(`LIMIT $${paramIndex++}`)
  params.push(limit)

  const where = conditions
    .filter(c => !c.startsWith('LIMIT'))
    .join(' AND ')

  const limitClause = `LIMIT $${paramIndex - 1}`

  const query = `
    SELECT
      id,
      slug,
      province,
      name,
      type,
      source,
      thumbnail,
      photos,
      lat,
      lng,
      price_cad,
      price_before_taxes,
      rating,
      reviews,
      sleeps,
      bedrooms,
      bathrooms,
      amenities,
      check_in_time,
      check_out_time,
      google_link,
      affiliate_url,
      is_featured,
      available,
      image_alt,
      created_at
    FROM affiliatecottages
    WHERE ${where}
    ORDER BY ${orderBy}
    ${limitClause}
  `

  let client
  try {
    client = await getPool().connect()
    console.log('SQL query:', query, JSON.stringify(params))
    const { rows } = await client.query(query, params)
    return rows.map(row => ({
      ...row,
      rating:    row.rating    ? parseFloat(row.rating)    : null,
      price_cad: row.price_cad ? parseInt(row.price_cad)   : null,
      reviews:   row.reviews   ? parseInt(row.reviews)     : null,
      sleeps:    row.sleeps    ? parseInt(row.sleeps)      : null,
      bedrooms:  row.bedrooms  ? parseInt(row.bedrooms)    : null,
      bathrooms: row.bathrooms ? parseInt(row.bathrooms)   : null,
      photos:    typeof row.photos    === 'string' ? JSON.parse(row.photos)    : row.photos    || [],
      amenities: typeof row.amenities === 'string' ? JSON.parse(row.amenities) : row.amenities || [],
    }))
  } finally {
    if (client) client.release()
  }
}

/**
 * getCottageBySlugFeatured — pour l'affichage homepage
 * Retourne 1 cottage featured par destination (avec fallback)
 *
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function getCottageBySlugFeatured(slug) {
  let client
  try {
    client = await getPool().connect()
    const { rows } = await client.query(`
      SELECT *
      FROM affiliatecottages
      WHERE slug = $1
        AND available = true
        AND is_hidden = false
        AND is_featured = true
      ORDER BY rating DESC NULLS LAST
      LIMIT 1
    `, [slug])

    if (rows.length === 0) return null
    const row = rows[0]
    return {
      ...row,
      rating:    row.rating    ? parseFloat(row.rating)    : null,
      price_cad: row.price_cad ? parseInt(row.price_cad)   : null,
      reviews:   row.reviews   ? parseInt(row.reviews)     : null,
      sleeps:    row.sleeps    ? parseInt(row.sleeps)      : null,
      bedrooms:  row.bedrooms  ? parseInt(row.bedrooms)    : null,
      bathrooms: row.bathrooms ? parseInt(row.bathrooms)   : null,
      photos:    typeof row.photos    === 'string' ? JSON.parse(row.photos)    : row.photos    || [],
      amenities: typeof row.amenities === 'string' ? JSON.parse(row.amenities) : row.amenities || [],
    }
  } finally {
    if (client) client.release()
  }
}

/**
 * getDestinationStats — pour les pages province
 * Retourne le nombre de cottages disponibles par destination
 *
 * @param {string} province
 * @returns {Promise<Array>}
 */
export async function getDestinationStats(province = null) {
  let client
  try {
    client = await getPool().connect()
    const condition = province
      ? `WHERE province = $1 AND available = true AND is_hidden = false`
      : `WHERE available = true AND is_hidden = false`
    const params    = province ? [province] : []

    const { rows } = await client.query(`
      SELECT
        slug,
        province,
        COUNT(*)                                  AS total,
        ROUND(AVG(rating)::numeric, 1)            AS avg_rating,
        MIN(price_cad)                            AS min_price,
        MAX(last_synced)                          AS last_synced
      FROM affiliatecottages
      ${condition}
      GROUP BY slug, province
      ORDER BY province, slug
    `, params)

    return rows
  } finally {
    if (client) client.release()
  }
}
