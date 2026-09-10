// scripts/migrate-images-to-blob.mjs
import { put } from '@vercel/blob'
import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const storeId = process.env.VERCEL_BLOB_STORE_ID
if (!storeId) {
  console.error('❌ VERCEL_BLOB_STORE_ID not set in environment')
  process.exit(1)
}

console.log(`Using Blob Store ID: ${storeId}`)

const { rows } = await pool.query(
  `SELECT id, name, url, mimetype FROM library_images 
   WHERE url LIKE 'data:%'`
)

console.log(`Found ${rows.length} images to migrate`)

let migrated = 0
let errors = 0

for (const img of rows) {
  try {
    const base64Data = img.url.split(',')[1]
    if (!base64Data) {
      console.log(`⚠ ${img.name} (id: ${img.id}) - no base64 data, skipping`)
      continue
    }
    const buffer = Buffer.from(base64Data, 'base64')
    const blob = await put(img.name, buffer, {
      access: 'public',
      contentType: img.mimetype,
      storeId
    })
    await pool.query(
      'UPDATE library_images SET url = $1 WHERE id = $2',
      [blob.url, img.id]
    )
    migrated++
    console.log(`✓ ${img.name} → ${blob.url}`)
  } catch (err) {
    errors++
    console.error(`✗ ${img.name} (id: ${img.id}) failed:`, err.message)
  }
}

console.log(`\nDone. Migrated: ${migrated}, Errors: ${errors}`)
await pool.end()
process.exit(errors > 0 ? 1 : 0)