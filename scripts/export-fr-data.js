/**
 * export-fr-data.js
 * Export FR translations + EN siblings from LOCAL database
 * Usage: DATABASE_URL="local" node scripts/export-fr-data.js
 */
const { Client } = require('pg');
const fs = require('fs');

const conn = process.env.DATABASE_URL || '';
if (!/127\.0\.0\.1|localhost/.test(conn)) {
  console.error('REFUSING: DATABASE_URL is not local.');
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: conn });
  await client.connect();
  
  const result = {
    exportedAt: new Date().toISOString(),
    site_settings: [],
    pages: [],
    articles: []
  };

  try {
    // 1. site_settings - export FR + EN sibling (by section)
    // Check if translation_of column exists
    const hasTranslationOf = (await client.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'site_settings' AND column_name = 'translation_of'
    `)).rows.length > 0;

    let settingsQuery = `
      SELECT s1.section, s1.locale, s1.data
      FROM site_settings s1
      WHERE s1.locale = 'fr'
      ORDER BY s1.section
    `;

    if (hasTranslationOf) {
      settingsQuery = `
        SELECT s1.section, s1.locale, s1.data, s1.translation_of,
               s2.section as en_section
        FROM site_settings s1
        LEFT JOIN site_settings s2 
          ON s1.translation_of = s2.id
        WHERE s1.locale = 'fr'
        ORDER BY s1.section
      `;
    }

    const settingsRows = await client.query(settingsQuery);
    
    for (const row of settingsRows.rows) {
      result.site_settings.push({
        section: row.section,
        locale: row.locale,
        data: row.data,
        translation_of_section: row.en_section || null // Use section to find EN sibling in prod
      });
    }
    console.log(`site_settings FR: ${result.site_settings.length} rows`);

    // 2. pages - export FR + EN sibling (by slug)
    const pagesRows = await client.query(`
      SELECT p1.*, 
             p2.id as en_id,
             p2.slug as en_slug
      FROM pages p1
      LEFT JOIN pages p2 
        ON p1.translation_of = p2.id
      WHERE p1.locale = 'fr'
      ORDER BY p1.slug
    `);

    for (const row of pagesRows.rows) {
      const { en_id, en_slug, translation_of, ...pageData } = row;
      result.pages.push({
        ...pageData,
        translation_of_slug: en_slug // Use slug to find EN sibling in prod
      });
    }
    console.log(`pages FR: ${result.pages.length} rows`);

    // 3. articles - export FR + EN sibling (by slug)
    const articlesRows = await client.query(`
      SELECT a1.*, 
             a2.id as en_id,
             a2.slug as en_slug
      FROM articles a1
      LEFT JOIN articles a2 
        ON a1.translation_of = a2.id
      WHERE a1.locale = 'fr'
      ORDER BY a1.slug
    `);

    for (const row of articlesRows.rows) {
      const { en_id, en_slug, translation_of, ...articleData } = row;
      result.articles.push({
        ...articleData,
        translation_of_slug: en_slug // Use slug to find EN sibling in prod
      });
    }
    console.log(`articles FR: ${result.articles.length} rows`);

    // Write to file
    const outputPath = 'fr-data-export.json';
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\nExported to ${outputPath}`);
    console.log(`Total: ${result.site_settings.length} settings + ${result.pages.length} pages + ${result.articles.length} articles`);

  } catch (e) {
    console.error('EXPORT FAILED:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });