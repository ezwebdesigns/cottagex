/**
 * migrate-page-images.mjs — uploads base64 data-URL images embedded in
 * pages.location_data to Vercel Blob (public), replacing them with direct
 * public URLs (LocationTemplate passes hero.image straight to next/image).
 * Dedupes by content hash.
 *
 * Usage: node --env-file=.env.local scripts/migrate-page-images.mjs [--dry-run]
 * Env: DATABASE_URL must be LOCAL. BLOB_READ_WRITE_TOKEN + VERCEL_BLOB_STORE_ID required.
 */
import pkg from 'pg';
import { put } from '@vercel/blob';
import { createHash } from 'node:crypto';

const { Pool } = pkg;
const conn = process.env.DATABASE_URL || '';
if (!/127\.0\.0\.1|localhost/.test(conn)) {
  console.error('REFUSING: DATABASE_URL is not local.');
  process.exit(1);
}
const token = process.env.BLOB_READ_WRITE_TOKEN;
const storeId = process.env.VERCEL_BLOB_STORE_ID;
if (!token) {
  console.error('BLOB_READ_WRITE_TOKEN missing.');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');
const DATA_URL_RE = /data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]{10000,})/g;

const pool = new Pool({ connectionString: conn });
const client = await pool.connect();
try {
  const { rows } = await client.query('SELECT id, slug, location_data::text AS d FROM pages WHERE location_data::text LIKE \'%data:image%\'');
  console.log(`${rows.length} page(s) with embedded base64`);
  const hashToUrl = new Map();
  let uploaded = 0;
  let reused = 0;
  for (const row of rows) {
    const matches = [...row.d.matchAll(DATA_URL_RE)];
    if (!matches.length) continue;
    let updated = row.d;
    for (const m of matches) {
      const [full, mime, b64] = m;
      const hash = createHash('sha256').update(b64).digest('hex').slice(0, 16);
      let url = hashToUrl.get(hash);
      if (url === undefined) {
        const ext = mime.split('/')[1].replace('jpeg', 'jpg');
        if (!dryRun) {
          const buffer = Buffer.from(b64, 'base64');
          const blob = await put(`migrated/pages-${row.slug}-${hash.slice(0, 8)}.${ext}`, buffer, {
            access: 'public',
            contentType: mime,
            ...(storeId ? { storeId } : {}),
          });
          url = blob.url;
          await client.query(
            'INSERT INTO library_images (name, url, mimetype) VALUES ($1, $2, $3)',
            [`pages-${row.slug}`, url, mime],
          );
          uploaded++;
        } else {
          url = `NEW(pages-${row.slug})`;
        }
        hashToUrl.set(hash, url);
      } else {
        reused++;
      }
      if (!dryRun) updated = updated.split(full).join(url);
    }
    if (!dryRun && updated !== row.d) {
      await client.query('UPDATE pages SET location_data = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        updated,
        row.id,
      ]);
      console.log(`  ${row.slug}: migrated`);
    }
  }
  console.log(dryRun ? 'Dry-run terminé.' : `Done. uploaded=${uploaded} reused-by-hash=${reused}`);
} finally {
  client.release();
  await pool.end();
}
