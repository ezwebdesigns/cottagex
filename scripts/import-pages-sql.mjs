/**
 * import-pages-sql.mjs — imports public/sql/pages_rows.sql (prod dump) locally.
 * The dump targets a legacy schema (integer id, no locale/translation_of),
 * so it goes through a staging table, then into pages with fresh uuids.
 * Idempotent-ish: TRUNCATEs pages first (local pages are test-only).
 *
 * Usage: node scripts/import-pages-sql.mjs
 * Env: DATABASE_URL must be LOCAL.
 */
import pkg from 'pg';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pkg;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const conn = process.env.DATABASE_URL || '';
if (!/127\.0\.0\.1|localhost/.test(conn)) {
  console.error('REFUSING: DATABASE_URL is not local.');
  process.exit(1);
}

const pool = new Pool({ connectionString: conn });
const client = await pool.connect();
try {
  await client.query('DROP TABLE IF EXISTS pages_staging');
  await client.query(`CREATE TABLE pages_staging (
    id integer, title text, slug text, template text, content text,
    seo_title text, meta_description text, featured_image text,
    faq text, cta_title text, cta_button text, cta_link text,
    cta_description text, explore_title text, explore_subtitle text,
    explore_description text, explore_items text, location_data text,
    is_published boolean, published_at timestamptz,
    created_at timestamptz, updated_at timestamptz
  )`);
  console.log('staging table created');

  const sqlText = readFileSync(join(root, 'public/sql/pages_rows.sql'), 'utf8');
  // Rewrite target table to staging (dump says "public"."pages").
  const staged = sqlText.replace(/INSERT INTO "public"\."pages"/g, 'INSERT INTO pages_staging');
  const res = await client.query(staged);
  console.log(`staging rows: ${res.rowCount}`);

  await client.query('TRUNCATE pages RESTART IDENTITY CASCADE');

  // Row-by-row import: some prod JSON blobs contain over-escaped quotes
  // (\\" instead of \") because prod stores them in TEXT columns without
  // validation. Normalize, else the jsonb cast fails (22P02).
  const normalizeJson = (value, fallback) => {
    if (value == null || value === '') return fallback;
    try {
      JSON.parse(value);
      return value;
    } catch {}
    const fixed = value.replace(/\\\\"/g, '\\"');
    try {
      JSON.parse(fixed);
      return fixed;
    } catch {
      throw new Error(`unrecoverable JSON value: ${String(value).slice(0, 120)}`);
    }
  };

  const rows = (await client.query('SELECT * FROM pages_staging ORDER BY id')).rows;
  let imported = 0;
  for (const s of rows) {
    await client.query(
      `INSERT INTO pages
        (title, slug, template, content, seo_title, meta_description,
         featured_image, faq, cta_title, cta_button, cta_link, cta_description,
         explore_title, explore_subtitle, explore_description, explore_items,
         location_data, locale, translation_of,
         is_published, published_at, created_at, updated_at)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17::jsonb,
         'en', NULL,$18,$19,$20,$21)`,
      [
        s.title, s.slug, s.template, s.content,
        s.seo_title || null, s.meta_description || null,
        s.featured_image || null, normalizeJson(s.faq, '[]'),
        s.cta_title || null, s.cta_button || null, s.cta_link || null,
        s.cta_description || null, s.explore_title || null,
        s.explore_subtitle || null, s.explore_description || null,
        normalizeJson(s.explore_items, '[]'), normalizeJson(s.location_data, '{}'),
        s.is_published, s.published_at, s.created_at, s.updated_at,
      ],
    );
    imported++;
  }
  console.log(`pages imported: ${imported}`);
  await client.query('DROP TABLE pages_staging');

  const byTpl = await client.query(
    'SELECT template, locale, COUNT(*) n FROM pages GROUP BY 1, 2 ORDER BY 1, 2',
  );
  for (const x of byTpl.rows) console.log(`  ${x.template} [${x.locale}]: ${x.n}`);
} finally {
  client.release();
  await pool.end();
}
