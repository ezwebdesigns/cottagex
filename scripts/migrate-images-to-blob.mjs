// scripts/migrate-images-to-blob.mjs
import { put } from '@vercel/blob'
import pkg from 'pg'
import dotenv from 'dotenv'
const { Pool } = pkg

dotenv.config({ path: '.env.local' })
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const storeId = process.env.VERCEL_BLOB_STORE_ID
if (!storeId) {
  console.error('❌ VERCEL_BLOB_STORE_ID not set in environment')
  process.exit(1)
}

console.log(`Using Blob Store ID: ${storeId}`)

// Find images that need migration:
// 1. Base64 data URLs (data:%)
// 2. Private Vercel Blob URLs (private.blob.vercel-storage.com)
const { rows } = await pool.query(
  `SELECT id, name, url, mimetype FROM library_images 
   WHERE url LIKE 'data:%'
      OR url LIKE '%private.blob.vercel-storage.com%'`
)

console.log(`Found ${rows.length} images to migrate`)

let migrated = 0
let skipped = 0
let errors = 0

for (const img of rows) {
  try {
    let buffer
    let contentType = img.mimetype

    if (img.url.startsWith('data:')) {
      // Base64 data URL
      const match = img.url.match(/^data:([^;]+);base64,(.+)$/)
      if (!match) {
        console.log(`⚠ ${img.name} (id: ${img.id}) - no base64 data, skipping`)
        skipped++
        continue
      }

      const [, mime, b64] = match
      const buffer = Buffer.from(b64, 'base64')

      const blob = await put(`migrated/${img.id}-${img.name || 'image'}`, buffer, {
        access: 'public',
        contentType: mime || img.mimetype || 'image/jpeg',
        storeId
      })

      await pool.query(
        'UPDATE library_images SET url = $1 WHERE id = $2',
        [blob.url, img.id]
      )

      migrated++
      console.log(`✓ ${img.name} → ${blob.url}`)
    } else if (img.url.includes('private.blob.vercel-storage.com')) {
      // Private Vercel Blob URL - download and re-upload
      console.log(`  Downloading from private store: ${img.name}`)
      const response = await fetch(img.url)
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`)
      }
      const buffer = Buffer.from(await response.arrayBuffer())
      if (!img.mimetype) {
        const contentType = response.headers.get('content-type')
        if (contentType) {
          contentType = contentType
        }
      }

      const blob = await put(`migrated/${img.id}-${img.name || 'image'}`, buffer, {
        access: 'public',
        contentType: img.mimetype || 'image/jpeg',
        storeId
      })

      await pool.query(
        'UPDATE library_images SET url = $1 WHERE id = $2',
        [blob.url, img.id]
      )

      migrated++
      console.log(`✓ ${img.name} → ${blob.url}`)
    } else {
      skipped++
      console.log(`⚠ ${img.name} (id: ${img.id}) - unknown URL format, skipping`)
    }
  } catch (err) {
    errors++
    console.error(`✗ ${img.name} (id: ${img.id}) failed:`, err.message)
  }
}

console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}, Errors: ${errors}`)
await pool.end()
process.exit(errors > 0 ? 1 : 0)