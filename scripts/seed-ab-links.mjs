/**
 * seed-ab-links.mjs
 * Seeds city-level affiliate links for Alberta's /cottage-country/alberta page.
 *
 * Usage:
 *   node --env-file=.env scripts/seed-ab-links.mjs
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
  { cityKey: 'Kananaskis',     url: 'https://vrbo.com/affiliates/search-kananaskis-dateless.hpgeZVS' },
  { cityKey: 'Pigeon Lake',    url: 'https://vrbo.com/affiliates/search-pigeon-lake-dateless.JTYQEjI' },
  { cityKey: 'Banff',          url: 'https://vrbo.com/affiliates/search-banff-dateless.uLSnrdE' },
  { cityKey: 'Jasper',         url: 'https://vrbo.com/affiliates/search-jasper-dateless.NWq6ZUd' },
  { cityKey: 'Lake Louise',    url: 'https://vrbo.com/affiliates/search-lake-louise-dateless.2e9ouLC' },
  { cityKey: 'Calgary',        url: 'https://vrbo.com/affiliates/search-edmonton-dateless.J66XrGc' },
  { cityKey: 'Edmonton',       url: 'https://vrbo.com/affiliates/search-edmonton-dateless.J66XrGc' },
  { cityKey: 'Waterton Lakes', url: 'https://vrbo.com/affiliates/search-waterton-park-dateless.i2udAza' },
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
    console.log(`Seeded ${inserted} AB city search_links rows`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => { console.error(err); process.exit(1); });
