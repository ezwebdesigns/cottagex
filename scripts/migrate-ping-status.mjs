// Phase 2 migration: split the overloaded ping_status column.
// Safe/idempotent: ADD COLUMN IF NOT EXISTS + backfill, no DROP, no DELETE.
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '') ? {} : { ssl: { rejectUnauthorized: false } }),
})

const client = await pool.connect()
try {
  await client.query('BEGIN')

  await client.query(`ALTER TABLE affiliatecottages ADD COLUMN IF NOT EXISTS last_ping_status integer`)
  await client.query(`ALTER TABLE affiliatecottages ADD COLUMN IF NOT EXISTS absence_count integer NOT NULL DEFAULT 0`)
  await client.query(`ALTER TABLE affiliatecottages ADD COLUMN IF NOT EXISTS availability_reason text`)
  await client.query(`COMMENT ON COLUMN affiliatecottages.ping_status IS 'DEPRECATED (Phase 2): use last_ping_status / absence_count / availability_reason'`)

  const backfill = await client.query(`
    UPDATE affiliatecottages
    SET last_ping_status = CASE WHEN ping_status BETWEEN 100 AND 599 THEN ping_status END,
        absence_count = 0,
        availability_reason = CASE
          WHEN available = false AND ping_status BETWEEN 100 AND 599 THEN 'ping_404'
          WHEN available = false THEN 'manual'
          ELSE NULL
        END
    WHERE availability_reason IS NULL AND (ping_status IS NOT NULL OR available = false)
  `)
  console.log('Backfilled rows:', backfill.rowCount)

  await client.query('COMMIT')

  const { rows } = await pool.query(`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE last_ping_status = 404)::int AS http_404,
      count(*) FILTER (WHERE last_ping_status = 429)::int AS http_429,
      count(*) FILTER (WHERE last_ping_status IS NULL)::int AS no_ping_status,
      count(*) FILTER (WHERE availability_reason = 'ping_404')::int AS reason_ping_404,
      count(*) FILTER (WHERE availability_reason = 'manual')::int AS reason_manual,
      count(*) FILTER (WHERE availability_reason IS NULL)::int AS reason_null,
      count(*) FILTER (WHERE absence_count > 0)::int AS absence_positive
    FROM affiliatecottages
  `)
  console.log('RESULT', JSON.stringify(rows[0], null, 2))
} catch (e) {
  await client.query('ROLLBACK')
  console.error('MIGRATION_FAILED:', e.message)
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
