import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const r = await pool.query(`select province, slug, count(*)::text as n from affiliatecottages where source='dataforseo' and ota_links <> '{}'::jsonb group by province, slug order by province, n desc`);
const byProv = new Map();
for (const x of r.rows) {
  if (!byProv.has(x.province)) byProv.set(x.province, []);
  byProv.get(x.province).push(x);
}
const lines = ['## Tableau des 244 chalets — Province / Ville (slug)', ''];
for (const [p, rows] of byProv) {
  const items = rows.map(x => `${x.slug} (${x.n})`).join(', ');
  lines.push(`### ${p} — ${rows.reduce((s,x)=>s+Number(x.n),0)} chalets`);
  lines.push(items);
  lines.push('');
}
process.stdout.write(lines.join('\n'));
await pool.end();
