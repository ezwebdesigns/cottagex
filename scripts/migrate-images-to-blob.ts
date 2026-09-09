import { db } from '@/lib/db';
import { libraryImages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';

const BASE64_RE = /^data:image\/[a-z+.-]+;base64,[A-Za-z0-9+/=]+$/;

async function migrate() {
  console.log('Fetching all images from library_images...');
  const rows = await db.select().from(libraryImages);
  console.log(`Found ${rows.length} images`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    if (BASE64_RE.test(row.url)) {
      try {
        const match = row.url.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) {
          console.log(`Skipping ${row.id}: invalid base64 format`);
          skipped++;
          continue;
        }

        const [, mime, b64] = match;
        const buffer = Buffer.from(b64, 'base64');

        const blob = await put(`migrated/${row.id}-${row.name || 'image'}`, buffer, {
          access: 'public',
          contentType: mime || row.mimetype || 'image/jpeg',
        });

        await db.update(libraryImages)
          .set({ url: blob.url, mimetype: mime || row.mimetype })
          .where(eq(libraryImages.id, row.id));

        migrated++;
        console.log(`Migrated ${row.id} → ${blob.url}`);
      } catch (err) {
        errors++;
        console.error(`Error migrating ${row.id}:`, err);
      }
    } else {
      skipped++;
    }
  }

  console.log(`\nDone. Migrated: ${migrated}, Skipped (already migrated/non-base64): ${skipped}, Errors: ${errors}`);
  process.exit(errors > 0 ? 1 : 0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});