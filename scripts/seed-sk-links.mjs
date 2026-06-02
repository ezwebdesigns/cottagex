/**
 * seed-sk-links.mjs
 * Seeds city-level affiliate links for Saskatchewan's /cottage-country/saskatchewan page.
 *
 * Usage:
 *   node --env-file=.env scripts/seed-sk-links.mjs
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
  { cityKey: 'Waskesiu Lake',                url: 'https://vrbo.com/affiliates/search-waskesiu-lake-dateless.701bxVT' },
  { cityKey: 'Regina',                        url: 'https://vrbo.com/affiliates/search-regina-dateless.4ywFRvx' },
  { cityKey: 'Saskatoon',                     url: 'https://vrbo.com/affiliates/search-saskatoon-dateless.CeTIdzD' },
  { cityKey: 'Prince Albert National Park',   url: 'https://vrbo.com/affiliates/search-prince-albert-national-park-dateless.tD34rkl' },
  { cityKey: 'Lake Diefenbaker',              url: 'https://vrbo.com/affiliates/search-diefenbaker-lake-dateless.Ke4v9RX' },
  { cityKey: 'Cypress Hills',                 url: 'https://vrbo.com/affiliates/search-cypress-hills-treeosix-adventure-park-dateless.IeXDGjY' },
  { cityKey: 'Emma Lake',                     url: 'https://vrbo.com/affiliates/search-emma-lake-dateless.pGFf0bM' },
  { cityKey: 'Moose Jaw',                     url: 'https://vrbo.com/affiliates/search-moose-jaw-dateless.SaL3fE4' },
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
    console.log(`Seeded ${inserted} SK city search_links rows`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => { console.error(err); process.exit(1); });
