// Final safe targeted cleanup for COTTAGEX affiliatecottages table
import pg from 'pg';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 4,
});

(async () => {
  const targetDomains = ['%vrbo.com', '%expedia.com', '%expedia.ca', '%booking.com'];

  // 1) Count candidates safely
  const countSQL = `
    SELECT count(*)::text AS total
    FROM affiliatecottages a
    WHERE
      (CASE WHEN jsonb_typeof(a.ota_links) = 'array' THEN jsonb_array_length(a.ota_links) > 0 ELSE false END)
      AND
      (CASE WHEN jsonb_typeof(a.amenities) = 'array' THEN jsonb_array_length(a.amenities) > 0 ELSE false END)
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(a.ota_links) AS l
        WHERE l->>'domain' ILIKE ANY ($1)
      )
  `;
  const countRes = await pool.query(countSQL, [targetDomains]);
  const candidateCount = parseInt(countRes.rows[0].total, 10);
  console.log('Rows that meet deletion criteria:', candidateCount);

  if (candidateCount === 0) {
    console.log('Nothing to delete. Exiting.');
    await pool.end();
    return;
  }

  // 2) Delete the candidates
  const deleteSQL = `
    WITH candidate_ids AS (
      SELECT a.id
      FROM affiliatecottages a
      WHERE
        (CASE WHEN jsonb_typeof(a.ota_links) = 'array' THEN jsonb_array_length(a.ota_links) > 0 ELSE false END)
        AND
        (CASE WHEN jsonb_typeof(a.amenities) = 'array' THEN jsonb_array_length(a.amenities) > 0 ELSE false END)
        AND NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(a.ota_links) AS l
          WHERE l->>'domain' ILIKE ANY ($1)
        )
    )
    DELETE FROM affiliatecottages
    WHERE id IN (SELECT id FROM candidate_ids)
    RETURNING id
  `;
  const delRes = await pool.query(deleteSQL, [targetDomains]);
  console.log('Rows deleted:', delRes.rowCount);

  // 3) Verify after deletion
  const totalRes = await pool.query(`SELECT count(*)::text AS total FROM affiliatecottages`);
  console.log('Total rows after deletion:', totalRes.rows[0].total);

  // 4) Rows without amenities (should be unchanged)
  const noAmenRes = await pool.query(`
    SELECT count(*)::text AS total FROM affiliatecottages
    WHERE amenities IS NULL
       OR jsonb_typeof(amenities) <> 'array'
       OR (jsonb_typeof(amenities) = 'array' AND jsonb_array_length(amenities) = 0)
  `);
  console.log('Rows without amenities (should be kept):', noAmenRes.rows[0].total);

  // 5) Sample rows kept without amenities
  const sampleRes = await pool.query(`
    SELECT id, province, name, ota_links, amenities
    FROM affiliatecottages
    WHERE amenities IS NULL
       OR jsonb_typeof(amenities) <> 'array'
       OR (jsonb_typeof(amenities) = 'array' AND jsonb_array_length(amenities) = 0)
    LIMIT 20
  `);
  console.log('\nSample rows kept (no amenities):');
  for (const r of sampleRes.rows) {
    console.log('id:', r.id, '| province:', r.province, '| name:', r.name);
    console.log('  ota_links:', JSON.stringify(r.ota_links));
    console.log('  amenities:', JSON.stringify(r.amenities));
  }

  await pool.end();
})();
