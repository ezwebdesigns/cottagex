const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_Yq5DfVIswFB9@ep-morning-frog-apofbubd-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require', 
  ssl: { rejectUnauthorized: false } 
});

const tables = [
  'affiliatecottages', 'articles', 'pages', 'properties',
  'site_settings', 'library_images', 'messages', 'search_links',
  'users', 'subscribers', 'brands', 'category_tags',
  'home_categories', 'category_content', 'catalogue_pages',
  'featured_sections', 'home_sections', 'hero_banners',
  'cta_cards', 'ad_banners', 'b44_products'
];

async function truncate() {
  for (const table of tables) {
    try {
      await pool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
      console.log(`Tronqué: ${table}`);
    } catch (e) {
      console.log(`Pas de table ${table} ou erreur:`, e.message);
    }
  }
  console.log('Toutes les tables tronquées');
  pool.end();
}

truncate().catch(e => { console.error(e.message); pool.end(); });