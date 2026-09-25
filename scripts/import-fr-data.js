/**
 * import-fr-data.js
 * Import FR translations + EN siblings into PRODUCTION database
 * Usage: DATABASE_URL="prod" node scripts/import-fr-data.js
 * 
 * Reads fr-data-export.json, maps EN siblings via slug/section to production IDs,
 * and upserts FR rows with correct translation_of pointing to production EN IDs.
 */
const { Client } = require('pg');
const fs = require('fs');

const inputPath = 'fr-data-export.json';
if (!fs.existsSync(inputPath)) {
  console.error('ERROR: fr-data-export.json not found. Run export first.');
  process.exit(1);
}

const conn = process.env.DATABASE_URL || '';
if (!/pooler\.supabase\.com|supabase\.co/.test(conn)) {
  console.warn('WARNING: DATABASE_URL does not look like production Supabase pooler.');
  console.warn('Current:', conn.substring(0, 50) + '...');
}

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    // ============================================
    // 1. site_settings
    // Match EN by section, upsert FR with translation_of -> EN.id
    // ============================================
    console.log('\n=== Importing site_settings ===');
    for (const fr of data.site_settings) {
      // Find EN sibling in production by section
      const enRes = await client.query(
        `SELECT id FROM site_settings WHERE section = $1 AND locale = 'en'`,
        [fr.section]
      );
      if (enRes.rows.length === 0) {
        console.warn(`  WARNING: No EN sibling found for section "${fr.section}"`);
        continue;
      }
      const enId = enRes.rows[0].id;

      // Upsert FR
      await client.query(`
        INSERT INTO site_settings (section, locale, data, translation_of)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (section, locale) DO UPDATE SET
          data = EXCLUDED.data,
          translation_of = EXCLUDED.translation_of,
          updated_at = now()
      `, [fr.section, fr.locale, JSON.stringify(fr.data), fr.translation_of_section ? (await client.query(
        `SELECT id FROM site_settings WHERE section = $1 AND locale = 'en'`, [fr.translation_of_section]
      )).rows[0]?.id || null : null]);
      
      console.log(`  ✓ ${fr.section} (FR) -> translation_of = ${fr.translation_of_section ? '(mapped)' : 'null'}`);
    }

    // ============================================
    // 2. pages
    // Match EN by slug, upsert FR with translation_of -> EN.id
    // ============================================
    console.log('\n=== Importing pages ===');
    for (const fr of data.pages) {
      // Find EN sibling in production by slug
      const enRes = await client.query(
        `SELECT id FROM pages WHERE slug = $1 AND locale = 'en'`,
        [fr.translation_of_slug]
      );
      if (enRes.rows.length === 0) {
        console.warn(`  WARNING: No EN sibling found for page slug "${fr.translation_of_slug}"`);
        continue;
      }
      const enId = enRes.rows[0].id;

      // Build column list and values for UPSERT
      const { translation_of_slug, id: localId, ...pageData } = fr;

      // Get translation_of ID first
      const translationOfId = fr.translation_of_slug ? (await client.query(
        `SELECT id FROM pages WHERE slug = $1 AND locale = 'en'`, [fr.translation_of_slug]
      )).rows[0]?.id || null : null;

      const columns = [...Object.keys(pageData), 'translation_of'];
      const values = [...Object.values(pageData), translationOfId];
      const placeholders = columns.map((_, i) => `$${i + 1}`);
      
      const query = `
        INSERT INTO pages (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT (slug, locale) DO UPDATE SET
          ${Object.keys(pageData).filter(c => c !== 'id' && c !== 'slug' && c !== 'locale' && c !== 'updated_at')
            .map(c => `${c} = EXCLUDED.${c}`).join(', ')},
          updated_at = now()
      `;

      await client.query(query, values);
      console.log(`  ✓ ${fr.slug} (FR) -> translation_of = ${fr.translation_of_slug ? 'mapped' : 'null'}`);
    }

    // ============================================
    // 3. articles
    // Match EN by slug, upsert FR with translation_of -> EN.id
    // ============================================
    console.log('\n=== Importing articles ===');
    for (const fr of data.articles) {
      // Find EN sibling in production by slug
      const enRes = await client.query(
        `SELECT id FROM articles WHERE slug = $1 AND locale = 'en'`,
        [fr.translation_of_slug]
      );
      if (enRes.rows.length === 0) {
        console.warn(`  WARNING: No EN sibling found for article slug "${fr.translation_of_slug}"`);
        continue;
      }
      const enId = enRes.rows[0].id;

const { translation_of_slug, id: localId, ...articleData } = fr;

      // Get translation_of ID first
      const translationOfId = fr.translation_of_slug ? (await client.query(
        `SELECT id FROM articles WHERE slug = $1 AND locale = 'en'`, [fr.translation_of_slug]
      )).rows[0]?.id || null : null;

      // Stringify JSON fields for pg
      const articleDataCopy = { ...articleData };
      if (articleDataCopy.faq && typeof articleDataCopy.faq === 'object') {
        articleDataCopy.faq = JSON.stringify(articleDataCopy.faq);
      }

      const columns = [...Object.keys(articleDataCopy), 'translation_of'];
      const values = [...Object.values(articleDataCopy), translationOfId];
      const placeholders = columns.map((_, i) => `$${i + 1}`);
      
      const query = `
        INSERT INTO articles (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT (slug, locale) DO UPDATE SET
          ${Object.keys(articleDataCopy).filter(c => c !== 'id' && c !== 'slug' && c !== 'locale' && c !== 'updated_at')
            .map(c => `${c} = EXCLUDED.${c}`).join(', ')},
          updated_at = now()
      `;

      await client.query(query, values);
    }

    await client.query('COMMIT');
    console.log('\n✅ Import completed successfully!');

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('IMPORT FAILED:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });