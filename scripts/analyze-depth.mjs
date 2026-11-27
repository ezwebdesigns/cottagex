// Depth stats: photos, amenities, ota links per listing
import pg from 'pg';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 4,
});

(async () => {
  const r = await pool.query(`
    SELECT
      round(avg(jsonb_array_length(photos))::numeric, 1) AS avg_photos,
      min(jsonb_array_length(photos)) AS min_photos,
      max(jsonb_array_length(photos)) AS max_photos,
      round(avg(jsonb_array_length(amenities))::numeric, 1) AS avg_amenities,
      min(jsonb_array_length(amenities)) AS min_amenities,
      max(jsonb_array_length(amenities)) AS max_amenities,
      count(*) FILTER (WHERE jsonb_typeof(ota_links) = 'array' AND jsonb_array_length(ota_links) > 0) AS with_ota_array
    FROM affiliatecottages
  `);
  const x = r.rows[0];
  console.log('Photos: avg', x.avg_photos, '| min', x.min_photos, '| max', x.max_photos);
  console.log('Amenities: avg', x.avg_amenities, '| min', x.min_amenities, '| max', x.max_amenities);
  console.log('Listings with ota_links array:', x.with_ota_array);

  // Rich profile: has price, rating, reviews and >=5 photos
  const rich = await pool.query(`
    SELECT count(*)::text AS total
    FROM affiliatecottages
    WHERE price_cad IS NOT NULL
      AND rating IS NOT NULL
      AND reviews IS NOT NULL
      AND jsonb_array_length(photos) >= 5
  `);
  console.log('Listings with price + rating + reviews + >=5 photos:', rich.rows[0].total);

  await pool.end();
})();
