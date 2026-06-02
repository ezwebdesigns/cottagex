/**
 * seed-nb-links.mjs
 * Seeds city-level affiliate links for New Brunswick's /cottage-country/new-brunswick page.
 *
 * Usage:
 *   node --env-file=.env scripts/seed-nb-links.mjs
 */

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const CATEGORIES = [
  'Luxury Cottages in',
  'Pet Friendly Cottages in',
  'Family Cottage Resort in',
  'Lakefront Cottage in',
  'Cottage with Hot Tub in',
  'Romantic Cottage for 2 in',
];
const MORE = [
  'Cottage Rentals in',
  'Chalet for Rent in',
  'Cabin for Rent in',
  'Waterfront Cottage in',
  'Log Wood Cottage in',
  'Mountain Cottage in',
];

const CITIES = [
  { cityKey: 'St. Andrews',         url: 'https://vrbo.com/affiliates/search-st-andrews-dateless.ZbQzvPW' },
  { cityKey: 'Miramichi',           url: 'https://vrbo.com/affiliates/search-miramichi-dateless.iqpnjzr' },
  { cityKey: 'Moncton',             url: 'https://vrbo.com/affiliates/search-moncton-dateless.6bfXPQW' },
  { cityKey: 'Fundy National Park', url: 'https://vrbo.com/affiliates/search-fundy-national-park-dateless.aG7ywCB' },
  { cityKey: 'Saint John',          url: 'https://vrbo.com/affiliates/search-saint-john-dateless.9brm1pF' },
  { cityKey: 'Fredericton',         url: 'https://vrbo.com/affiliates/search-fredericton-dateless.OgfMwaw' },
  { cityKey: 'Acadian Peninsula',   url: 'https://vrbo.com/affiliates/search-acadian-peninsula-dateless.bJ5LRJX' },
  { cityKey: 'Shediac',             url: 'https://vrbo.com/affiliates/search-shediac-dateless.1iVCiaR' },
];

async function seed() {
  const client = await pool.connect();
  try {
    const existing = CITIES.map(c => c.cityKey);
    await client.query('DELETE FROM search_links WHERE city = ANY($1::text[])', [existing]);
    let inserted = 0;
    for (const c of CITIES) {
      for (const kw of [...CATEGORIES, ...MORE]) {
        const category = `${kw} ${c.cityKey}`;
        await client.query(
          'INSERT INTO search_links (city, category, affiliate_url, platform) VALUES ($1, $2, $3, $4)',
          [c.cityKey, category, c.url, 'vrbo'],
        );
        inserted++;
      }
    }
    console.log(`Seeded ${inserted} NB city search_links rows`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
