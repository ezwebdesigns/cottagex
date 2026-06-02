/**
 * seed-ontario-links.mjs
 * Seeds city-level affiliate links for Ontario's /cottage-country/ontario page.
 *
 * Usage:
 *   node --env-file=.env scripts/seed-ontario-links.mjs
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

// cityKey=db group key, labelCity=text used in category string, display=shown to user
const CITIES = [
  { cityKey: 'Muskoka',          labelCity: 'Muskoka',          url: 'https://vrbo.com/affiliates/search-muskoka-lakes-dateless.i1p6qgQ' },
  { cityKey: 'Haliburton',       labelCity: 'Haliburton',       url: 'https://vrbo.com/affiliates/search-haliburton-county-dateless.gko8ZuN' },
  { cityKey: 'The Kawarthas',    labelCity: 'the Kawarthas',    url: 'https://vrbo.com/affiliates/search-kawartha-lakes-dateless.fVLi4tH' },
  { cityKey: 'Georgian Bay',     labelCity: 'Georgian Bay',     url: 'https://vrbo.com/affiliates/search-georgian-bay-dateless.BtiLYDA' },
  { cityKey: 'Ottawa Valley',    labelCity: 'Ottawa Valley',    url: 'https://vrbo.com/affiliates/search-ottawa-valley-dateless.FNS8k4T' },
  { cityKey: 'Rideau Lakes',     labelCity: 'Rideau Lakes',     url: 'https://vrbo.com/affiliates/search-rideau-lakes-dateless.N069pfM' },
  { cityKey: 'Prince Edward County', labelCity: 'Prince Edward County', url: 'https://vrbo.com/affiliates/search-prince-edward-dateless.aw8hFUC' },
  { cityKey: 'Algonquin Highlands', labelCity: 'Algonquin', url: 'https://vrbo.com/affiliates/search-algonquin-highlands-dateless.PZNHaPL' },
];

async function seed() {
  const client = await pool.connect();
  try {
    const existing = CITIES.map(c => c.cityKey);
    await client.query(`DELETE FROM search_links WHERE city = ANY($1::text[])`, [existing]);
    let inserted = 0;
    for (const c of CITIES) {
      for (const kw of [...CATEGORIES, ...MORE]) {
        const category = `${kw} ${c.labelCity}`;
        await client.query(
          'INSERT INTO search_links (city, category, affiliate_url, platform) VALUES ($1, $2, $3, $4)',
          [c.cityKey, category, c.url, 'vrbo'],
        );
        inserted++;
      }
    }
    console.log(`Seeded ${inserted} Ontario city search_links rows`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
