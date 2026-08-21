const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_Yq5DfVIswFB9@ep-morning-frog-apofbubd-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require', 
  ssl: { rejectUnauthorized: false } 
});

pool.query("SELECT count(*) FROM affiliatecottages").then(r => console.log('Cottages:', r.rows[0].count));
pool.query("SELECT count(*) FROM articles").then(r => console.log('Articles:', r.rows[0].count));
pool.query("SELECT count(*) FROM pages").then(r => console.log('Pages:', r.rows[0].count));
pool.query("SELECT count(*) FROM site_settings").then(r => console.log('Site settings:', r.rows[0].count));
pool.query("SELECT count(*) FROM library_images").then(r => console.log('Library images:', r.rows[0].count));
pool.end();