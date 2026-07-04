import { readFileSync } from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL manquante'); process.exit(1); }

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false, require: true } });

async function main() {
  const sql = readFileSync('public/schema.sql', 'utf8');
  await pool.query(sql);
  console.log('✅ Schema appliqué avec succès');
  await pool.end();
}

main().catch(err => { console.error('Erreur:', err.message); process.exit(1); });
