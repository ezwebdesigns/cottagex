/**
 * seed-mb-links.mjs
 * Seeds city-level affiliate links for Manitoba's /cottage-country/manitoba page.
 *
 * Usage:
 *   node --env-file=.env scripts/seed-mb-links.mjs
 */

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const CATEGORIES = [
  'Luxury Cottages in', 'Pet Friendly Cottages in', 'Family Cottage Resort in',
  'Lakefront Cottage in', 'Cottage with Hot Tub in', 'Romantic Cottage for 2 in',
];
const MORE = [
  'Cottage Rentals in', 'Chalet for Rent in', 'Cabin for Rent in',
  'Waterfront Cottage in', 'Log Wood Cottage in', 'Mountain Cottage in',
];

const CITIES = [
  { cityKey: 'Falcon Lake',                url: 'https://vrbo.com/affiliates/search-falcon-lake-dateless.EZRGSfF' },
  { cityKey: 'West Hawk Lake',             url: 'https://vrbo.com/affiliates/search-west-hawk-lake-dateless.08Tj5Ia' },
  { cityKey: 'Winnipeg',                   url: 'https://vrbo.com/affiliates/search-winnipeg-dateless.lxLe2Qs' },
  { cityKey: 'Clear Lake',                 url: 'https://vrbo.com/affiliates/search-clear-lake-dateless.q9bd9Rq' },
  { cityKey: 'Lake Winnipeg',              url: 'https://vrbo.com/affiliates/search-lake-winnipeg-dateless.vZZmRFn' },
  { cityKey: 'Gimli',                      url: 'https://vrbo.com/affiliates/search-gimli-dateless.MTyODwD' },
  { cityKey: 'Whiteshell Provincial Park', url: 'https://vrbo.com/affiliates/search-whiteshell-provincial-park-dateless.1ugFBUf' },
  { cityKey: 'Hecla',                      url: 'https://vrbo.com/affiliates/search-hecla-island-dateless.TSaKXdE' },
];

async function seed() {
  const client = await pool.connect();
  try {
    const existing = CITIES.map(c => c.cityKey);
    await client.query('DELETE FROM search_links WHERE city = ANY($1::text[])', [existing]);
    let inserted = 0;
    for (const c of CITIES) {
      for (const kw of [...CATEGORIES, ...MORE]) {
        await client.query(
          'INSERT INTO search_links (city, category, affiliate_url, platform) VALUES ($1, $2, $3, $4)',
          [c.cityKey, `${kw} ${c.cityKey}`, c.url, 'vrbo'],
        );
        inserted++;
      }
    }
    console.log(`Seeded ${inserted} MB city search_links rows`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => { console.error(err); process.exit(1); });
