import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 1 });
try {
  const r = await pool.query(`SELECT province, count(*)::int AS n, count(*) FILTER (WHERE available = true)::int AS n_avail
    FROM affiliatecottages GROUP BY province ORDER BY n ASC, province ASC`);
  console.log('[provinces]', JSON.stringify(r.rows, null, 2));
  const total = r.rows.reduce((s, x) => s + x.n, 0);
  console.log('[provinces] total =', total);
} catch (e) { console.error('[provinces] ERR', e.message); process.exit(1); } finally { await pool.end(); }
