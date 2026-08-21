/**
 * scripts/migrate-images-to-blob.mjs
 *
 * Migre toutes les images base64 (data:image/...) stockées dans Postgres
 * vers Vercel Blob et remplace les valeurs par des URLs publiques.
 *
 * Usage :
 *   node scripts/migrate-images-to-blob.mjs            # dry-run (aucune écriture)
 *   node scripts/migrate-images-to-blob.mjs --apply    # migre réellement
 *
 * Exige BLOB_READ_WRITE_TOKEN dans .env.local (ou l'environnement).
 * Idempotent : relancer ne fait rien (plus de data-URIs à migrer).
 * Backup local avant écriture : scripts/backup-images-before-blob.json
 */

import { put } from '@vercel/blob';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const APPLY = process.argv.includes('--apply');

const env = Object.fromEntries(
  fs
    .readFileSync(path.resolve('.env.local'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const TOKEN = env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
if (!TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN manquant (dans .env.local)');
  process.exit(1);
}
process.env.BLOB_READ_WRITE_TOKEN = TOKEN;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  family: 4,
});

const DATA_URI_RE = /^data:image\/([a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/;
const urlCache = new Map(); // hash sha1 court -> url blob
let uploads = 0;
let replaced = 0;

async function uploadDataUri(uri) {
  const m = uri.match(DATA_URI_RE);
  if (!m) return null;
  const [, mime, b64] = m;
  const buf = Buffer.from(b64, 'base64');
  const hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12);
  if (urlCache.has(hash)) return urlCache.get(hash);
  const ext = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const blob = await put(`cottages/${hash}.${ext}`, buf, {
    access: 'public',
    addRandomSuffix: false,
    contentType: mime,
  });
  urlCache.set(hash, blob.url);
  uploads++;
  return blob.url;
}

async function replaceDataUris(value, stats) {
  if (typeof value === 'string') {
    if (DATA_URI_RE.test(value)) {
      stats.found++;
      const url = await uploadDataUri(value);
      if (url) {
        stats.migrated++;
        return url;
      }
      return value;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return Promise.all(value.map((v) => replaceDataUris(v, stats)));
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = await replaceDataUris(v, stats);
    }
    return out;
  }
  return value;
}

async function main() {
  const backupFile = path.resolve('scripts/backup-images-before-blob.json');
  const backup = fs.existsSync(backupFile) ? JSON.parse(fs.readFileSync(backupFile, 'utf8')) : {};
  const stats = { found: 0, migrated: 0 };

  console.log(APPLY ? '🔄 MIGRATION RÉELLE' : '👀 DRY-RUN (--apply pour écrire)');

  // ── 1. library_images.url ────────────────────────────────────────────────
  const lib = await pool.query(`SELECT id, url FROM library_images`);
  for (const row of lib.rows) {
    if (!DATA_URI_RE.test(row.url)) continue;
    const next = await replaceDataUris(row.url, stats);
    if (next !== row.url) {
      backup[`library:${row.id}`] = row.url;
      if (APPLY) await pool.query(`UPDATE library_images SET url = $1 WHERE id = $2`, [next, row.id]);
      console.log(`  library #${row.id} → ${next.slice(0, 80)}`);
    }
  }

  // ── 2. articles.featured_image ───────────────────────────────────────────
  const arts = await pool.query(`SELECT id, slug, featured_image FROM articles WHERE featured_image IS NOT NULL`);
  for (const row of arts.rows) {
    if (!DATA_URI_RE.test(row.featured_image)) continue;
    const next = await replaceDataUris(row.featured_image, stats);
    if (next !== row.featured_image) {
      backup[`article:${row.id}`] = row.featured_image;
      if (APPLY) await pool.query(`UPDATE articles SET featured_image = $1 WHERE id = $2`, [next, row.id]);
      console.log(`  article "${row.slug}" → ${next.slice(0, 80)}`);
    }
  }

  // ── 3. pages.featured_image + pages.location_data (récursif) ─────────────
  const pgs = await pool.query(`SELECT id, slug, featured_image, location_data FROM pages`);
  for (const row of pgs.rows) {
    let changed = false;
    let nextFeat = row.featured_image;
    if (row.featured_image && DATA_URI_RE.test(row.featured_image)) {
      nextFeat = await replaceDataUris(row.featured_image, stats);
      changed = nextFeat !== row.featured_image;
    }
    let nextLoc = row.location_data;
    if (row.location_data) {
      const loc = await replaceDataUris(row.location_data, stats);
      if (JSON.stringify(loc) !== JSON.stringify(row.location_data)) {
        nextLoc = loc;
        changed = true;
      }
    }
    if (changed) {
      backup[`page:${row.id}`] = { featured_image: row.featured_image, location_data: row.location_data };
      if (APPLY) {
        await pool.query(`UPDATE pages SET featured_image = $1, location_data = $2 WHERE id = $3`, [
          nextFeat,
          nextLoc,
          row.id,
        ]);
      }
      console.log(`  page "${row.slug}" migrée`);
    }
  }

  // ── 4. site_settings.data (récursif, toutes les sections) ────────────────
  const sets = await pool.query(`SELECT id, section, data FROM site_settings`);
  for (const row of sets.rows) {
    const next = await replaceDataUris(row.data, stats);
    if (JSON.stringify(next) !== JSON.stringify(row.data)) {
      backup[`settings:${row.section}`] = row.data;
      if (APPLY) await pool.query(`UPDATE site_settings SET data = $1, updated_at = NOW() WHERE id = $2`, [next, row.id]);
      console.log(`  settings "${row.section}" migrée`);
    }
  }

  // ── Backup + rapport ─────────────────────────────────────────────────────
  if (APPLY && Object.keys(backup).length > 0) {
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`\n💾 Backup écrit : ${backupFile}`);
  }

  console.log(
    `\n✅ Terminé — data-URIs trouvés : ${stats.found}, migrés : ${stats.migrated}, uploads Blob : ${uploads}`
  );

  await pool.end();
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});