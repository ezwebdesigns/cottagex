// Remove the deprecated legacy ping_status column after Phase 2 backfill.
// No data loss: the HTTP status now lives in last_ping_status, absence counter
// in absence_count, and the decision reason in availability_reason.
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '') ? {} : { ssl: { rejectUnauthorized: false } }),
})

const client = await pool.connect()
try {
  await client.query('BEGIN')

  const { rows: before } = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'affiliatecottages' ORDER BY ordinal_position
  `)
  const hasLegacy = before.some(r => r.column_name === 'ping_status')
  console.log('Legacy ping_status present before:', hasLegacy)

  // Views that still select the old column must be recreated.
  await client.query('DROP VIEW IF EXISTS public.v_available_cottages')
  await client.query('DROP VIEW IF EXISTS public.v_featured_cottages')
  console.log('Dropped dependent views: v_available_cottages, v_featured_cottages')

  if (hasLegacy) {
    await client.query('ALTER TABLE affiliatecottages DROP COLUMN IF EXISTS ping_status')
    console.log('DROPPED COLUMN: affiliatecottages.ping_status')
  } else {
    console.log('Nothing to drop (already removed).')
  }

  await client.query(`
    CREATE OR REPLACE VIEW public.v_available_cottages AS
    SELECT * FROM affiliatecottages
    WHERE available = true
    ORDER BY rating DESC NULLS LAST
  `)
  await client.query(`
    CREATE OR REPLACE VIEW public.v_featured_cottages AS
    SELECT id, slug, name, google_link, affiliate_url, available, last_pinged,
           last_ping_status, absence_count, availability_reason
    FROM affiliatecottages
    WHERE is_featured = true
    ORDER BY slug, rating DESC NULLS LAST
  `)
  console.log('Recreated both views without ping_status')

  await client.query('COMMIT')

  const { rows: after } = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'affiliatecottages' ORDER BY ordinal_position
  `)
  const required = ['last_ping_status', 'absence_count', 'availability_reason']
  const missing = required.filter(c => !after.some(r => r.column_name === c))
  if (missing.length) throw new Error('Missing required Phase 2 columns: ' + missing.join(', '))

  const { rows: check } = await client.query(`
    SELECT count(*)::int AS total,
           count(*) FILTER (WHERE last_ping_status = 404)::int AS http_404,
           count(*) FILTER (WHERE last_ping_status = 429)::int AS http_429,
           count(*) FILTER (WHERE availability_reason = 'ping_404')::int AS reason_ping_404
    FROM affiliatecottages
  `)
  console.log('AFTER', JSON.stringify(check[0], null, 2))
  console.log('Legacy still present:', after.some(r => r.column_name === 'ping_status'))
} catch (e) {
  await client.query('ROLLBACK').catch(() => {})
  console.error('DROP_FAILED:', e.message)
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
