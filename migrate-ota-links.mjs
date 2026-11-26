import fs from 'node:fs';
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

await pool.query(`alter table if exists affiliatecottages
  add column if not exists ota_links jsonb default '{}';`);

const LATEST =
  process.env.DATAFORSEO_JSONL ||
  'C:/Users/mday/AppData/Local/hermes/cache/scratch/dfs-ota-links.jsonl';
const rows = [];
for (const line of fs.readFileSync(LATEST, 'utf8').split(/\r?\n/)) {
  if (!line.trim()) continue;
  rows.push(JSON.parse(line));
}
const byId = new Map(rows.map(r => [r.id, r]));

const counts = await pool.query(
  `select count(*)::text as n from affiliatecottages
   where source='dataforseo' and (affiliate_url is null or btrim(affiliate_url)='')
   and id = any($1::text[])`, [Array.from(byId.keys())]
);
const emptyWithAff = Number(counts.rows[0].n);
console.log('rows in batch:', rows.length, '| source rows already with affiliate_url:', emptyWithAff);

if (!emptyWithAff) {
  await pool.end();
  console.log('NOTHING TO DO');
  process.exit(0);
}

let applied = 0;
for (const [id, rec] of byId) {
  const links = (rec.links || []).map(l => ({
    domain: l.domain,
    url: l.url,
    paid: !!l.paid,
    official: !!l.official,
    offers: (l.offers || []).map(o => ({ title: o.title, url: o.url, max_visitors: o.max_visitors }))
  }));
  if (!links.length) continue;
  try {
    await pool.query(
      `update affiliatecottages set ota_links = $1::jsonb, updated_at = now() where id = $2`,
      [JSON.stringify(links), id]
    );
    applied++;
  } catch (e) {
    console.log('ERR', id, String(e.message).slice(0, 100));
  }
}
console.log('UPDATED', applied, 'of', rows.length);
await pool.end();
