// Export affiliate URLs for local Playwright classification
import pg from 'pg'
import fs from 'node:fs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 4 })
const { rows } = await pool.query(`
  SELECT id, name, affiliate_url, google_link, province
  FROM affiliatecottages
  WHERE affiliate_url IS NOT NULL AND affiliate_url <> ''
  ORDER BY id
`)
const out = 'C:/Users/mday/AppData/Local/hermes/cache/scratch/affiliate-list.json'
fs.writeFileSync(out, JSON.stringify(rows, null, 2), 'utf8')
console.log('Exported', rows.length, 'affiliate URLs to', out)
await pool.end()
