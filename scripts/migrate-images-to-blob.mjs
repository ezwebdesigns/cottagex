// scripts/migrate-images-to-blob.mjs
import { put } from '@vercel/blob'
import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const { rows } = await pool.query(
  `SELECT id, name, url, mimetype FROM library_images 
   WHERE url LIKE 'data:%'`
)

for (const img of rows) {
  const base64Data = img.url.split(',')[1]
  const buffer = Buffer.from(base64Data, 'base64')
  const blob = await put(img.name, buffer, {
    access: 'public',
    contentType: img.mimetype,
    storeId: process.env.VERCEL_BLOB_STORE_ID
  })
  await pool.query(
    'UPDATE library_images SET url = $1 WHERE id = $2',
    [blob.url, img.id]
  )
  console.log(`✓ ${img.name} → ${blob.url}`)
}

await pool.end()