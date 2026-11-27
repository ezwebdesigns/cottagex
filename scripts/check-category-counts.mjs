// Count cottages matched by each category condition (mirrors src/lib/cottages.js)
import pg from 'pg';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 4,
});

const CONDITIONS = {
  waterfront:  `(amenities @> '["Waterfront"]' OR amenities @> '["Beach access"]' OR amenities @> '["Accès à la plage"]' OR name ILIKE '%waterfront%' OR name ILIKE '%lakefront%' OR name ILIKE '%lake front%' OR name ILIKE '%lakeside%' OR name ILIKE '%beachfront%' OR name ILIKE '%oceanfront%' OR name ILIKE '%on the water%' OR name ILIKE '%sea view%')`,
  family:      `amenities @> '["Kid-friendly"]'`,
  'hot-tub':   `(amenities @> '["Hot tub"]' OR amenities @> '["Bain à remous"]' OR amenities @> '["Spa"]')`,
  coastal:     `(name ILIKE '%ocean%' OR name ILIKE '%coast%' OR name ILIKE '%harbour%' OR name ILIKE '%harbor%' OR name ILIKE '%bay%' OR name ILIKE '%sea%' OR name ILIKE '%island%' OR name ILIKE '%marina%' OR name ILIKE '%waterfront%')`,
  luxury:      `(rating >= 4.8 AND price_cad >= 600)`,
  'pet-friendly': `(amenities @> '["Pet-friendly"]' OR amenities @> '["Accepte les animaux"]')`,
  mountain:    `(name ILIKE '%mountain%' OR name ILIKE '%alpine%' OR name ILIKE '%chalet%' OR name ILIKE '%ski%' OR name ILIKE '%peaks%')`,
  romantic:    `(amenities @> '["Fireplace"]' OR amenities @> '["Cheminée"]' OR amenities @> '["Hot tub"]' OR amenities @> '["Bain à remous"]' OR name ILIKE '%cozy%' OR name ILIKE '%romantic%')`,
  'log-cabin': `(name ILIKE '%log%' OR name ILIKE '%cabin%' OR name ILIKE '%wooden%' OR name ILIKE '%timber%' OR name ILIKE '%chalet%')`,
  secluded:    `(name ILIKE '%secluded%' OR name ILIKE '%private%' OR name ILIKE '%quiet%' OR name ILIKE '%retreat%' OR name ILIKE '%peaceful%' OR name ILIKE '%hideaway%')`,
  beach:       `(amenities @> '["Beach access"]' OR amenities @> '["Accès à la plage"]' OR name ILIKE '%beach%' OR name ILIKE '%shore%' OR name ILIKE '%coast%' OR name ILIKE '%seaside%')`,
  resort:      `(name ILIKE '%resort%' OR name ILIKE '%village%' OR amenities @> '["Fitness center"]' OR amenities @> '["Centre de remise en forme"]' OR amenities @> '["Pool"]' OR amenities @> '["Piscine intérieure"]' OR amenities @> '["Piscine extérieure"]')`,
  skiing:      `(name ILIKE '%ski%' OR name ILIKE '%snow%' OR name ILIKE '%winter%' OR name ILIKE '%gondola%' OR name ILIKE '%slope%')`,
  hiking:      `(name ILIKE '%trail%' OR name ILIKE '%hiking%' OR name ILIKE '%park%' OR name ILIKE '%forest%' OR name ILIKE '%wilderness%' OR name ILIKE '%algonquin%')`,
  lakefront:   `(amenities @> '["Waterfront"]' OR amenities @> '["Beach access"]' OR amenities @> '["Accès à la plage"]' OR name ILIKE '%waterfront%' OR name ILIKE '%lakefront%' OR name ILIKE '%lake front%' OR name ILIKE '%beach access%' OR name ILIKE '%lakeside%' OR name ILIKE '%beachfront%' OR name ILIKE '%on the lake%' OR name ILIKE '%lake view%')`,
};

(async () => {
  console.log('CATEGORY | ALL (896) | FEATURED ONLY');
  for (const [id, cond] of Object.entries(CONDITIONS)) {
    const r = await pool.query(`
      SELECT
        count(*) FILTER (WHERE is_hidden = false AND available = true)::int AS all_count,
        count(*) FILTER (WHERE is_hidden = false AND available = true AND is_featured = true)::int AS feat_count
      FROM affiliatecottages
      WHERE ${cond}
    `);
    console.log(`${id} | ${r.rows[0].all_count} | ${r.rows[0].feat_count}`);
  }
  await pool.end();
})();
