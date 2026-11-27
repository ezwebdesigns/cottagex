// Analyze data richness / fill-rate per column in affiliatecottages
import pg from 'pg';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 4,
});

(async () => {
  const cols = [
    'name', 'type', 'source', 'thumbnail', 'photos', 'lat', 'lng',
    'price_cad', 'price_before_taxes', 'rating', 'reviews', 'sleeps',
    'bedrooms', 'bathrooms', 'sqm', 'amenities', 'excluded_amenities',
    'check_in_time', 'check_out_time', 'google_link', 'affiliate_url',
    'available', 'is_featured', 'last_synced', 'last_pinged', 'ping_status',
    'image_alt', 'is_hidden', 'ota_links'
  ];

  const totalRes = await pool.query(`SELECT count(*)::text AS total FROM affiliatecottages`);
  const total = parseInt(totalRes.rows[0].total, 10);
  console.log('Total rows:', total);
  console.log('\nCOLUMN | NON-NULL | % | DISTINCT | SAMPLE');
  console.log('------------------------------------------------------------');

  for (const col of cols) {
    const r = await pool.query(`
      SELECT
        count(*) FILTER (WHERE "${col}" IS NOT NULL)::text AS nonnull,
        count(DISTINCT "${col}")::text AS distinct_count
      FROM affiliatecottages
    `);
    const nonnull = parseInt(r.rows[0].nonnull, 10);
    const pct = ((nonnull / total) * 100).toFixed(1);
    const distinct = r.rows[0].distinct_count;

    // sample: try to get one non-null, non-empty value
    let sample = '';
    try {
      const s = await pool.query(`
        SELECT "${col}" AS v
        FROM affiliatecottages
        WHERE "${col}" IS NOT NULL
          AND "${col}"::text NOT IN ('', '[]', '{}', '0', 'null')
        LIMIT 1
      `);
      if (s.rows.length) {
        const v = s.rows[0].v;
        sample = JSON.stringify(v);
        if (sample && sample.length > 90) sample = sample.slice(0, 90) + '…';
      }
    } catch (e) {
      sample = '[sample error]';
    }

    console.log(`${col} | ${nonnull} | ${pct}% | ${distinct} | ${sample}`);
  }

  await pool.end();
})();
