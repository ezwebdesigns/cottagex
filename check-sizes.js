const { Pool } = require('pg');
const c = new Pool({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
(async () => {
  try {
    const r1 = await c.query('SELECT pg_column_size(*) as row_size FROM affiliatecottages LIMIT 1');
    console.log('Row size:', r1.rows[0].row_size, 'bytes');
    const r2 = await c.query("SELECT pg_column_size(photos) as photos_size FROM affiliatecottages WHERE photos IS NOT NULL LIMIT 5");
    console.log('Photos sizes:', r2.rows.map(r => r.photos_size + ' bytes'));
    const r3 = await c.query("SELECT pg_column_size(amenities) as amenities_size FROM affiliatecottages LIMIT 5");
    console.log('Amenities sizes:', r3.rows.map(r => r.amenities_size + ' bytes'));
    const r4 = await c.query('SELECT COUNT(*) FROM affiliatecottages');
    console.log('Total cottages:', r4.rows[0].count);
    const r5 = await c.query("SELECT pg_column_size(cover_photo) FROM (SELECT NULLIF(photos::text, '')::jsonb ->> 0 AS cover_photo FROM affiliatecottages WHERE photos IS NOT NULL LIMIT 1) t");
    console.log('Cover photo size:', r5.rows[0]);
    await c.end();
  } catch (e) { console.error(e); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
