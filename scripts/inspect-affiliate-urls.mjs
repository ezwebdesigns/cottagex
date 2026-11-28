// Inspect affiliate_url values — structure and reachability semantics
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 4 });

(async () => {
  const total = await pool.query(`SELECT count(*)::text AS total FROM affiliatecottages`);
  const withAff = await pool.query(`SELECT count(*)::text AS total FROM affiliatecottages WHERE affiliate_url IS NOT NULL AND affiliate_url <> ''`);
  console.log('Total fiches:', total.rows[0].total, '| avec affiliate_url:', withAff.rows[0].total);

  // distinct domains and sample URLs
  const dom = await pool.query(`
    SELECT split_part(affiliate_url, '/', 3) AS host, count(*)::int AS n
    FROM affiliatecottages WHERE affiliate_url IS NOT NULL AND affiliate_url <> ''
    GROUP BY 1 ORDER BY 2 DESC
  `);
  console.log('\nHosts des affiliate_url:');
  for (const r of dom.rows) console.log(' ', r.host, r.n);

  const samples = await pool.query(`
    SELECT id, name, affiliate_url, google_link, is_featured, available
    FROM affiliatecottages
    WHERE affiliate_url IS NOT NULL AND affiliate_url <> ''
    ORDER BY id LIMIT 15
  `);
  console.log('\nExemples:');
  for (const r of samples.rows) {
    console.log(' ', r.id, '| feat:', r.is_featured, '| avail:', r.available);
    console.log('    aff:', r.affiliate_url);
    console.log('    ggl:', r.google_link);
  }

  // combien de affiliate_url sont des deep links (contiennent un id de fiche) vs generiques
  const deep = await pool.query(`
    SELECT count(*)::text AS total FROM affiliatecottages
    WHERE affiliate_url IS NOT NULL
      AND (affiliate_url ~ '/[0-9]{5,}' OR affiliate_url ~ 'selected=' OR affiliate_url ~ '/pdp/' OR affiliate_url ~ '/Hotel-')
  `);
  console.log('\naffiliate_url avec identifiant de fiche (deep link):', deep.rows[0].total);

  // distribution of last_ping_status for those with affiliate_url
  const ping = await pool.query(`
    SELECT last_ping_status::text AS status, count(*)::int AS n
    FROM affiliatecottages WHERE affiliate_url IS NOT NULL
    GROUP BY 1 ORDER BY 2 DESC
  `);
  console.log('\nlast_ping_status des fiches avec affiliate_url:');
  for (const r of ping.rows) console.log('  status', r.status, ':', r.n);

  await pool.end();
})();
