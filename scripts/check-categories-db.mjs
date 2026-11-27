// Inspect homepage_categories stored in site_settings (DB) vs defaults
import pg from 'pg';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 4,
});

(async () => {
  // find table name for settings
  const tblRes = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND (table_name ILIKE '%setting%')
    ORDER BY table_name
  `);
  console.log('Settings tables:', tblRes.rows.map(r => r.table_name));

  // find column names
  const colRes = await pool.query(`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_schema='public' AND table_name='site_settings'
    ORDER BY ordinal_position
  `);
  console.log('site_settings columns:', colRes.rows.map(r => `${r.column_name}:${r.data_type}`).join(', '));

  // fetch homepage_categories + search_categories rows
  for (const section of ['homepage_categories','search_categories']) {
    const secRes = await pool.query(`
      SELECT * FROM site_settings WHERE section = $1
    `, [section]);
    console.log('\n=== ' + section + ' rows: ' + secRes.rowCount + ' ===');
    for (const r of secRes.rows) {
      console.log('locale:', r.locale, '| id:', r.id);
      console.log('data:', JSON.stringify(r.data, null, 2));
    }
  }

  await pool.end();
})();
