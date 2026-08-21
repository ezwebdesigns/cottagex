const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_Yq5DfVIswFB9@ep-morning-frog-apofbubd-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require', 
  ssl: { rejectUnauthorized: false } 
});
pool.query("ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_keywords TEXT").then(() => {
  console.log('Colonne seo_keywords ajoutee');
  pool.end();
}).catch(e => { console.error(e.message); pool.end(); });