import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const r = await pool.query(`select province, slug, name from affiliatecottages where source='dataforseo' and ota_links <> '{}'::jsonb order by province, slug, name`);
const rows = r.rows;
const byProv = new Map();
for (const x of rows) {
  if (!byProv.has(x.province)) byProv.set(x.province, []);
  byProv.get(x.province).push(x);
}
const parts = ['# Table des 244 chalets — Province / Ville (slug) / Source: dataforseo / ota_links', ''];
parts.push('| Province | Ville/secteur | N | Nom |');
parts.push('|---|---|---:|---|');
for (const [p, rs] of byProv) {
  for (const x of rs) {
    const nom = String(x.name || '').split('|')[0].trim().slice(0, 80);
    parts.push(`| ${p} | ${x.slug} | 1 | ${nom} |`);
  }
}
const out = parts.join('\n');
console.log(out);
await pool.end();
