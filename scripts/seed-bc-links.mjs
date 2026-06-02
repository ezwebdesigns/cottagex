/**
 * seed-bc-links.mjs
 * Seeds city-level affiliate links for BC's /cottage-country/british-columbia page.
 *
 * Usage:
 *   node --env-file=.env scripts/seed-bc-links.mjs
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
  { cityKey: 'Okanagan Valley',  url: 'https://vrbo.com/affiliates/search-okanagan-valley-dateless.Xa9StES' },
  { cityKey: 'Sunshine Coast',   url: 'https://vrbo.com/affiliates/search-sunshine-coast-regional-district-dateless.0BzC8NS' },
  { cityKey: 'Vancouver Island', url: 'https://vrbo.com/affiliates/search-vancouver-island-dateless.qlhpMzk' },
  { cityKey: 'Whistler',         url: 'https://vrbo.com/affiliates/search-whistler-dateless.eEIfD8E' },
  { cityKey: 'Tofino',           url: 'https://vrbo.com/affiliates/search-tofino-dateless.MThdFkJ' },
  { cityKey: 'Victoria',         url: 'https://vrbo.com/affiliates/search-victoria-dateless.HFEgINs' },
  { cityKey: 'Kelowna',          url: 'https://vrbo.com/affiliates/search-kelowna-dateless.lzoTBp7' },
  { cityKey: 'Squamish',         url: 'https://vrbo.com/affiliates/search-squamish-dateless.kcd97Id' },
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
    console.log(`Seeded ${inserted} BC city search_links rows`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
