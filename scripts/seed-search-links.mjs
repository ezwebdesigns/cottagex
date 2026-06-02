/**
 * seed-search-links.mjs
 * Seeds the search_links table with province-keyword affiliate links for the Search by City section.
 *
 * Usage:
 *   node --env-file=.env scripts/seed-search-links.mjs
 */

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const KEYWORDS = [
  'Luxury Cottages in',
  'Pet Friendly Cottages in',
  'Family Cottage Resort in',
  'Lakefront Cottage in',
  'Cottage with Hot Tub in',
  'Romantic Cottage for 2 in',
  'Cottage Rentals in',
  'Chalet for Rent in',
  'Cabin for Rent in',
  'Waterfront Cottage in',
  'Log Wood Cottage in',
  'Mountain Cottage in',
];

const PROVINCES = [
  { city: 'Ontario',          url: 'https://vrbo.com/affiliates/cottagerentals/ontario' },
  { city: 'Quebec',           url: 'https://vrbo.com/affiliates/cottagerentals/quebec' },
  { city: 'British Columbia', url: 'https://vrbo.com/affiliates/cottagerentals/british-columbia' },
  { city: 'New Brunswick',    url: 'https://vrbo.com/affiliates/cottagerentals/newbrunswick' },
  { city: 'Alberta',          url: 'https://vrbo.com/affiliates/search-alberta-dateless.aQombZh' },
  { city: 'Nova Scotia',      url: 'https://vrbo.com/affiliates/cottagerentals/novascotia' },
  { city: 'Manitoba',         url: 'https://vrbo.com/affiliates/cottagerentals/manitoba' },
  { city: 'Saskatchewan',     url: 'https://vrbo.com/affiliates/cottagerentals/saskatchewan' },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM search_links');
    let inserted = 0;
    for (const p of PROVINCES) {
      for (const kw of KEYWORDS) {
        const category = `${kw} ${p.city}`;
        await client.query(
          'INSERT INTO search_links (city, category, affiliate_url, platform) VALUES ($1, $2, $3, $4)',
          [p.city, category, p.url, 'vrbo'],
        );
        inserted++;
      }
    }
    console.log(`Seeded ${inserted} search_links rows`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
