import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { libraryImages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';

const BASE64_RE = /^data:image\/[a-z+.-]+;base64,[A-Za-z0-9+/=]+$/;
const MIGRATION_SECRET = process.env.MIGRATION_SECRET || 'dev-secret-change-in-production';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace('Bearer ', '');
  
  if (providedSecret !== MIGRATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Fetching all images from library_images...');
    const rows = await db.select().from(libraryImages);
    console.log(`Found ${rows.length} images`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    const results: Array<{ id: number; status: string; url?: string; error?: string }> = [];

    for (const row of rows) {
      if (BASE64_RE.test(row.url)) {
        try {
          const match = row.url.match(/^data:([^;]+);base64,(.+)$/);
          if (!match) {
            results.push({ id: row.id, status: 'skipped', error: 'invalid base64 format' });
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
          results.push({ id: row.id, status: 'migrated', url: blob.url });
          console.log(`Migrated ${row.id} → ${blob.url}`);
        } catch (err) {
          errors++;
          results.push({ id: row.id, status: 'error', error: String(err) });
          console.error(`Error migrating ${row.id}:`, err);
        }
      } else {
        skipped++;
        results.push({ id: row.id, status: 'skipped', error: 'not base64' });
      }
    }

    return NextResponse.json({
      success: true,
      migrated,
      skipped,
      errors,
      results,
    });
  } catch (err) {
    console.error('Migration failed:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}