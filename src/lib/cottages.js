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
  family:        `amenities @> '["Kid-friendly"]'`,
  hotTub:        `(amenities @> '["Hot tub"]' OR amenities @> '["Spa"]')`,
  'hot-tub':     `(amenities @> '["Hot tub"]' OR amenities @> '["Spa"]')`,
  lakefront:     `(amenities @> '["Waterfront"]' OR amenities @> '["Beach access"]' OR name ILIKE '%waterfront%' OR name ILIKE '%lakefront%' OR name ILIKE '%lake front%' OR name ILIKE '%beach access%' OR name ILIKE '%lakeside%' OR name ILIKE '%beachfront%')`,
  luxury:        `(rating >= 4.8 AND price_cad >= 600)`,
  'pet-friendly':`amenities @> '["Pet-friendly"]'`,
  all:           null,
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
 * @param {boolean} [opts.featuredOnly] - seulement is_featured = true (défaut: false)
 * @param {boolean} [opts.affiliateOnly] - seulement ceux avec affiliate_url (défaut: false)
 * @returns {Promise<Array>}
 */
export async function getCottages({
  slug        = null,
  province    = null,
  limit       = 3,
  sort        = 'rating',
  categories  = [],
  featuredOnly = false,
  affiliateOnly = false,
} = {}) {

  const conditions = featuredOnly ? [] : ['available = true']
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
    const condition = province ? `WHERE province = $1 AND available = true` : `WHERE available = true`
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
