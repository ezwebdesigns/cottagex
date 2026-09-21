/**
 * import-public-sql.mjs
 * Imports the production dumps in public/sql/ into the LOCAL Supabase DB.
 *
 * Steps:
 *   0. Canary: verify `OVERRIDING SYSTEM VALUE` + file encoding are accepted
 *      (rolled back, no data change).
 *   1. TRUNCATE the 4 covered tables (articles CASCADE wipes listicle_items).
 *   2. Execute every `insert into ...` line of each dump, collecting row errors.
 *   3. Re-seed the mock listicle article (id 101) + its 7 items, extracted
 *      from supabase/seed.sql (prod dump has ids 1-15, so 101 stays free).
 *   4. Fix serial sequences + print final counts.
 *
 * Usage:
 *   node scripts/import-public-sql.mjs
 *
 * Env: DATABASE_URL must point to the LOCAL db
 *   (postgresql://postgres:postgres@127.0.0.1:54322/postgres).
 * Refuses to run against anything else.
 */
import pkg from 'pg';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pkg;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const conn = process.env.DATABASE_URL || '';

if (!/127\.0\.0\.1|localhost/.test(conn)) {
  console.error('REFUSING: DATABASE_URL does not look local: ' + conn.replace(/:[^:@/]+@/, ':***@'));
  process.exit(1);
}

const pool = new Pool({ connectionString: conn });
const client = await pool.connect();

const DUMPS = [
  'public/sql/affiliatecottages.sql',
  'public/sql/articles.sql',
  'public/sql/library_images.sql',
  'public/sql/site_settings.sql',
];

try {
  // ── 1. truncate first (script is re-runnable) ──────────────────────────
  await client.query('TRUNCATE affiliatecottages, library_images, site_settings RESTART IDENTITY');
  await client.query('TRUNCATE articles RESTART IDENTITY CASCADE');
  console.log('truncated 4 tables (articles CASCADE -> listicle_items cleared)');

  // ── 0. canary (rolled back) ──────────────────────────────────────────
  const libLines = readFileSync(join(root, DUMPS[2]), 'utf8').split('\n');
  const canary = libLines.find((l) => /^insert into/i.test(l.trim()));
  if (!canary) throw new Error('no INSERT found in library_images.sql');
  await client.query('BEGIN');
  try {
    await client.query(canary);
    console.log('canary: OVERRIDING SYSTEM VALUE + encoding accepted');
  } finally {
    await client.query('ROLLBACK');
  }

  // ── 2. import ────────────────────────────────────────────────────────
  let totalOk = 0;
  const failures = [];
  for (const rel of DUMPS) {
    const text = readFileSync(join(root, rel), 'utf8');
    const lines = text.split('\n').filter((l) => /^insert into/i.test(l.trim()));
    let ok = 0;
    for (let i = 0; i < lines.length; i++) {
      try {
        await client.query(lines[i]);
        ok++;
      } catch (e) {
        failures.push(`${rel}#${i + 1}: ${(e.message || e).slice(0, 180)}`);
      }
    }
    totalOk += ok;
    console.log(`${rel}: ${ok}/${lines.length} rows imported`);
  }

  // ── 3. re-seed mock listicle 101 + items (full multi-line statements) ─
  const lisText = readFileSync(join(root, 'supabase/seed-listicle-101.sql'), 'utf8');
  await client.query(lisText);
  console.log('re-seeded mock listicle article 101 + 7 items');

  // ── 4. sequences + counts ────────────────────────────────────────────
  for (const [t, c] of [['articles', 'id'], ['library_images', 'id'], ['site_settings', 'id'], ['listicle_items', 'id']]) {
    await client.query(
      `SELECT setval(pg_get_serial_sequence('${t}', '${c}'), COALESCE(MAX(${c}), 1)) FROM ${t}`,
    );
  }
  for (const t of ['affiliatecottages', 'articles', 'listicle_items', 'library_images', 'site_settings', 'properties', 'search_links', 'pages', 'users']) {
    const r = await client.query(`SELECT COUNT(*)::int AS n FROM ${t}`);
    console.log(`  ${t}: ${r.rows[0].n}`);
  }

  if (failures.length) {
    console.log(`\nFAILURES (${failures.length}):`);
    for (const f of failures.slice(0, 20)) console.log('  ! ' + f);
    process.exitCode = 1;
  } else {
    console.log(`\nIMPORT CLEAN: ${totalOk} rows, 0 failures`);
  }
} finally {
  client.release();
  await pool.end();
}
