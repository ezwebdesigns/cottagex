const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_Yq5DfVIswFB9@ep-morning-frog-apofbubd-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require', 
  ssl: { rejectUnauthorized: false } 
});
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'affiliatecottages'").then(r => {
  console.log('Colonnes NEON:', r.rows.map(c => c.column_name).join(', '));
  pool.end();
}).catch(e => { console.error(e.message); pool.end(); });