import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const p = await pool.query("select slug,locale,is_published,length(content) len from pages where locale=\'fr\' order by slug limit 20");
console.log("PAGES_FR:", JSON.stringify(p.rows));
const a = await pool.query("select slug,locale,translation_of from articles where locale=\'fr\' limit 10");
console.log("ARTICLES_FR:", JSON.stringify(a.rows));
await pool.end();
