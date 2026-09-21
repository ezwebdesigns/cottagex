/**
 * migrate-settings-images.mjs — extracts embedded base64 data-URL images
 * from site_settings JSON into Vercel Blob (public) + library_images rows,
 * replacing them with lib:{id} refs (resolved at read time by resolveLibRefs).
 *
 * Why: ~10MB of base64 was embedded in settings (seo logo, destination
 * images), shipped raw inside EVERY page's HTML (13MB+ homepages).
 * Dedupes by content hash (EN/FR rows share identical images).
 *
 * Usage: node --env-file=.env.local scripts/migrate-settings-images.mjs [--dry-run]
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
const DATA_URL_RE = /data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)/g;

const pool = new Pool({ connectionString: conn });
const client = await pool.connect();
try {
  const { rows } = await client.query('SELECT id, section, locale, data::text AS d FROM site_settings');
  const hashToLibId = new Map();
  let uploaded = 0;
  let reused = 0;

  for (const row of rows) {
    const matches = [...row.d.matchAll(DATA_URL_RE)];
    if (!matches.length) continue;
    let updated = row.d;
    for (const m of matches) {
      const [full, mime, b64] = m;
      const hash = createHash('sha256').update(b64).digest('hex').slice(0, 16);
      let libId = hashToLibId.get(hash);
      if (libId === undefined) {
        // Reuse an existing library row with identical content, else upload.
        const ext = mime.split('/')[1].replace('jpeg', 'jpg');
        if (!dryRun) {
          const buffer = Buffer.from(b64, 'base64');
          const blob = await put(`migrated/settings-${row.section}-${hash.slice(0, 8)}.${ext}`, buffer, {
            access: 'public',
            contentType: mime,
            ...(storeId ? { storeId } : {}),
          });
          const ins = await client.query(
            'INSERT INTO library_images (name, url, mimetype) VALUES ($1, $2, $3) RETURNING id',
            [`settings-${row.section}`, blob.url, mime],
          );
          libId = ins.rows[0].id;
          uploaded++;
        } else {
          libId = `NEW(${row.section})`;
        }
        hashToLibId.set(hash, libId);
      } else {
        reused++;
      }
      if (!dryRun) updated = updated.replace(full, () => `lib:${libId}`);
    }
    if (!dryRun && updated !== row.d) {
      await client.query('UPDATE site_settings SET data = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        updated,
        row.id,
      ]);
      console.log(`  ${row.section} [${row.locale}]: migrated`);
    }
  }
  console.log(dryRun ? 'Dry-run terminé.' : `Done. uploaded=${uploaded} reused-by-hash=${reused}`);
} finally {
  client.release();
  await pool.end();
}
