/**
 * seed-ns-links.mjs
 * Seeds city-level affiliate links for Nova Scotia's /cottage-country/nova-scotia page.
 *
 * Usage:
 *   node --env-file=.env scripts/seed-ns-links.mjs
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
  { cityKey: 'Cape Breton',       url: 'https://vrbo.com/affiliates/search-cape-breton-island-dateless.XqJW1mV' },
  { cityKey: 'South Shore',       url: 'https://vrbo.com/affiliates/search-emerys-island-dateless.pydujVt' },
  { cityKey: 'Halifax',           url: 'https://vrbo.com/affiliates/search-halifax-dateless.tlYq8rf' },
  { cityKey: 'Lunenburg',         url: 'https://vrbo.com/affiliates/search-lunenburg-dateless.DsP0d02' },
  { cityKey: 'Annapolis Valley',  url: 'https://vrbo.com/affiliates/search-annapolis-valley-dateless.2qIgmji' },
  { cityKey: "Peggy's Cove",      url: 'https://vrbo.com/affiliates/search-peggys-cove-dateless.vH3Hij0' },
  { cityKey: 'Wolfville',         url: 'https://vrbo.com/affiliates/search-wolfville-dateless.RL8WuF1' },
  { cityKey: 'Digby',             url: 'https://vrbo.com/affiliates/search-digby-dateless.2dz5zXd' },
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
    console.log(`Seeded ${inserted} NS city search_links rows`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => { console.error(err); process.exit(1); });
