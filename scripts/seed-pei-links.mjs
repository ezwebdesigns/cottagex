/**
 * seed-pei-links.mjs
 * Seeds city-level affiliate links for PEI's /cottage-country/pei page.
 *
 * Usage:
 *   node --env-file=.env scripts/seed-pei-links.mjs
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
  { cityKey: 'North Shore',                      url: 'https://vrbo.com/affiliates/search-north-shore-dateless.C2SX4R6' },
  { cityKey: 'Points East',                      url: 'https://vrbo.com/affiliates/search-points-east-dateless.nHbYrBj' },
  { cityKey: 'Charlottetown',                    url: 'https://vrbo.com/affiliates/search-charlottetown-dateless.S2ZPAkj' },
  { cityKey: 'Cavendish',                        url: 'https://vrbo.com/affiliates/search-cavendish-dateless.D1mpLDS' },
  { cityKey: 'Prince Edward Island National Park', url: 'https://vrbo.com/affiliates/search-prince-edward-island-national-park-dateless.XzuIbIs' },
  { cityKey: 'Summerside',                       url: 'https://vrbo.com/affiliates/search-summerside-dateless.iFOmoU0' },
  { cityKey: 'Brackley Beach',                   url: 'https://vrbo.com/affiliates/search-greenwich-dateless.NvLGv3v' },
  { cityKey: 'Greenwich',                        url: 'https://vrbo.com/affiliates/search-greenwich-dateless.NvLGv3v' },
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
    console.log(`Seeded ${inserted} PEI city search_links rows`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => { console.error(err); process.exit(1); });
