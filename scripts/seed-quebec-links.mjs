/**
 * seed-quebec-links.mjs
 * Seeds city-level affiliate links for Quebec's /cottage-country/quebec page.
 *
 * Usage:
 *   node --env-file=.env scripts/seed-quebec-links.mjs
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
  { cityKey: 'The Laurentians',    labelCity: 'the Laurentians',    url: 'https://vrbo.com/affiliates/search-laurentians-dateless.zLlua6K' },
  { cityKey: 'Eastern Townships',  labelCity: 'Eastern Townships',  url: 'https://vrbo.com/affiliates/search-eastern-townships-dateless.1ISvhwl' },
  { cityKey: 'Charlevoix',         labelCity: 'Charlevoix',         url: 'https://vrbo.com/affiliates/search-charlevoix-dateless.MfRTViD' },
  { cityKey: 'Lanaudière',         labelCity: 'Lanaudière',         url: 'PLACEHOLDER_LANAUDIERE_URL' },
  { cityKey: 'Québec City',        labelCity: 'Québec City',        url: 'https://vrbo.com/affiliates/search-quebec-dateless.7UBbZWM' },
  { cityKey: 'Mont-Tremblant',     labelCity: 'Mont-Tremblant',     url: 'https://vrbo.com/affiliates/search-monttremblant-dateless.imz3fJn' },
  { cityKey: 'Gaspé',              labelCity: 'Gaspé',              url: 'https://vrbo.com/affiliates/search-gaspsielesdelamadeleine-dateless.U3Cr4my' },
  { cityKey: 'Saguenay',           labelCity: 'Saguenay',           url: 'https://vrbo.com/affiliates/search-saguenaylacsaintjean-dateless.5wgAZ3b' },
];

async function seed() {
  const client = await pool.connect();
  try {
    const existing = CITIES.map(c => c.cityKey);
    await client.query('DELETE FROM search_links WHERE city = ANY($1::text[])', [existing]);
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
    console.log(`Seeded ${inserted} Quebec city search_links rows`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
