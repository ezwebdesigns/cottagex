/**
 * migrate-article-images.mjs — uploads base64 data-URL featured_images
 * to Vercel Blob (public) and replaces them with direct public URLs.
 * (Unlike settings JSON, article images are consumed directly by
 * next/image + OG tags, so plain URLs — not lib: refs.)
 * Dedupes by content hash (EN/FR rows share identical images).
 *
 * Usage: node --env-file=.env.local scripts/migrate-article-images.mjs [--dry-run]
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
const DATA_URL_RE = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/;

const pool = new Pool({ connectionString: conn });
const client = await pool.connect();
try {
  const { rows } = await client.query(
    "SELECT id, slug, locale, featured_image FROM articles WHERE featured_image LIKE 'data:%'",
  );
  console.log(`${rows.length} article image(s) embedded as base64`);
  const hashToUrl = new Map();
  let uploaded = 0;
  let reused = 0;
  for (const row of rows) {
    const m = row.featured_image.match(DATA_URL_RE);
    if (!m) {
      console.log(`  SKIP #${row.id} (${row.slug}): unrecognized data URL`);
      continue;
    }
    const [, mime, b64] = m;
    const hash = createHash('sha256').update(b64).digest('hex').slice(0, 16);
    let url = hashToUrl.get(hash);
    if (url === undefined) {
      const ext = mime.split('/')[1].replace('jpeg', 'jpg');
      if (!dryRun) {
        const buffer = Buffer.from(b64, 'base64');
        const blob = await put(`migrated/articles-${row.slug.slice(0, 40)}-${hash.slice(0, 8)}.${ext}`, buffer, {
          access: 'public',
          contentType: mime,
          ...(storeId ? { storeId } : {}),
        });
        url = blob.url;
        await client.query(
          'INSERT INTO library_images (name, url, mimetype) VALUES ($1, $2, $3)',
          [`articles-${row.slug.slice(0, 40)}`, url, mime],
        );
        uploaded++;
      } else {
        url = `NEW(articles-${row.slug.slice(0, 30)})`;
      }
      hashToUrl.set(hash, url);
    } else {
      reused++;
    }
    if (!dryRun) {
      await client.query('UPDATE articles SET featured_image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        url,
        row.id,
      ]);
    }
  }
  console.log(dryRun ? 'Dry-run terminé.' : `Done. uploaded=${uploaded} reused-by-hash=${reused}`);
} finally {
  client.release();
  await pool.end();
}
