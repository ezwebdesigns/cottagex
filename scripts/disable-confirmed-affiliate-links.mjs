// Disable the 18 manually confirmed unavailable affiliate links (NO deletes)
import pg from 'pg'
import fs from 'node:fs'

const CSV = 'C:/Users/mday/AppData/Local/hermes/cache/scratch/affiliate-redirect-final-candidates.csv'
const lines = fs.readFileSync(CSV, 'utf8').split(/\r?\n/).filter(Boolean)
const ids = lines.slice(1).map(l => l.split(',')[0])
if (ids.length !== 18) throw new Error(`Expected 18 IDs, got ${ids.length}`)
if (new Set(ids).size !== 18) throw new Error('Duplicate IDs in candidate list')

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 4,
})
const client = await pool.connect()

try {
  const before = await client.query(`
    SELECT count(*)::text AS total,
           count(*) FILTER (WHERE available = false)::text AS unavailable
    FROM affiliatecottages
  `)
  const found = await client.query(
    `SELECT count(*)::text AS total FROM affiliatecottages WHERE id = ANY($1)`,
    [ids]
  )
  const stillAvailable = await client.query(
    `SELECT count(*)::text AS total FROM affiliatecottages WHERE id = ANY($1) AND available = true`,
    [ids]
  )
  console.log('BEFORE total:', before.rows[0].total, '| unavailable:', before.rows[0].unavailable)
  console.log('Candidate IDs found in DB:', found.rows[0].total)
  console.log('Candidate IDs still available:', stillAvailable.rows[0].total)

  if (found.rows[0].total !== '18') throw new Error('Not all 18 IDs exist in DB — aborting')
  if (stillAvailable.rows[0].total === '0') {
    console.log('All 18 already unavailable — nothing to update.')
  } else {
    const upd = await client.query(`
      UPDATE affiliatecottages
      SET available = false,
          ping_status = 404,
          last_pinged = NOW()
      WHERE id = ANY($1)
      RETURNING id, name, available, ping_status, last_pinged
    `, [ids])
    console.log('Rows updated:', upd.rowCount)
    for (const r of upd.rows.slice(0, 5)) {
      console.log('  ', r.id, '|', r.name?.slice(0, 45), '|', r.available, r.ping_status)
    }
  }

  const after = await client.query(`
    SELECT count(*)::text AS total,
           count(*) FILTER (WHERE available = false)::text AS unavailable
    FROM affiliatecottages
  `)
  console.log('AFTER total:', after.rows[0].total, '| unavailable:', after.rows[0].unavailable)

  const verify = await client.query(`
    SELECT count(*)::text AS total
    FROM affiliatecottages
    WHERE id = ANY($1) AND available = false AND ping_status = 404
  `, [ids])
  console.log('Verified 18 candidates unavailable + ping_status 404:', verify.rows[0].total)
} finally {
  client.release()
  await pool.end()
}
