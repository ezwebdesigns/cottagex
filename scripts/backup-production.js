/**
 * Script de Backup Complet - Production Cottagex
 * Sauvegarde : Base de données (toutes tables)
 * Usage : node scripts/backup-production.js
 * Prérequis : .env.production avec DATABASE_URL pointant vers NEON
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.production' });

const BACKUP_DIR = `backups/backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
const TABLES = [
  'affiliatecottages', 'articles', 'pages', 'properties',
  'site_settings', 'library_images', 'messages', 'search_links',
  'users', 'subscribers', 'brands', 'category_tags',
  'home_categories', 'category_content', 'catalogue_pages',
  'featured_sections', 'home_sections', 'hero_banners',
  'cta_cards', 'ad_banners', 'b44_products',
  'home_sections', 'cta_cards', 'ad_banners'
];

async function main() {
  console.log('🚀 Backup Production Cottagex');
  console.log('==============================');
  
  // 1. Vérifier .env.production
  if (!fs.existsSync('.env.production')) {
    console.error('❌ Fichier .env.production manquant. Créez-le avec DATABASE_URL pointant vers NEON.');
    process.exit(1);
  }
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL non trouvée dans .env.production');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL chargée');
  
  // 2. Créer dossier de backup
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Dossier backup : ${BACKUP_DIR}`);
  
  // 3. Connexion PostgreSQL
  const pgClient = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();
  console.log('✅ Connexion DB établie');
  
  // 4. Export toutes les tables
  const dbData = {};
  const sqlLines = [];
  const counts = {};
  
  for (const table of TABLES) {
    try {
      const res = await pgClient.query(`SELECT * FROM ${table}`);
      dbData[table] = res.rows;
      counts[table] = res.rows.length;
      
      // Générer SQL INSERT
      if (res.rows.length > 0) {
        const columns = Object.keys(res.rows[0]).join(', ');
        const values = res.rows.map(row => {
          const vals = Object.values(row).map(v => {
            if (v === null) return 'NULL';
            if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
            if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
            return v;
          }).join(', ');
          return `(${vals})`;
        }).join(',\n');
        sqlLines.push(`INSERT INTO ${table} (${columns}) VALUES\n${values};\n`);
      }
      console.log(`  📋 ${table}: ${res.rows.length} lignes`);
    } catch (e) {
      console.log(`  ⚠️ ${table}: ${e.message}`);
      counts[table] = 0;
    }
  }
  
  // 5. Sauvegarder JSON
  fs.writeFileSync(path.join(BACKUP_DIR, 'database.json'), JSON.stringify(dbData, null, 2));
  console.log('✅ database.json sauvegardé');
  
  // 6. Sauvegarder SQL
  const sqlHeader = `-- Backup Cottagex Production\n-- Date: ${new Date().toISOString()}\n-- Tables: ${TABLES.filter(t => counts[t] > 0).join(', ')}\n\n`;
  fs.writeFileSync(path.join(BACKUP_DIR, 'database.sql'), sqlHeader + sqlLines.join('\n'));
  console.log('✅ database.sql sauvegardé');
  
  // 7. Manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    databaseUrl: databaseUrl.replace(/:[^:@]+@/, ':****@'), // masque password
    tables: counts,
    totalRows: Object.values(counts).reduce((a, b) => a + b, 0)
  };
  fs.writeFileSync(path.join(BACKUP_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  
  // 5. Validation
  await validateBackup(BACKUP_DIR, counts);
  
  await pgClient.end();
  console.log('\n✅ BACKUP TERMINÉ AVEC SUCCÈS');
  console.log(`📁 Dossier : ${BACKUP_DIR}`);
  console.log(`📊 Total lignes : ${manifest.totalRows}`);
}

async function validateBackup(backupDir, counts) {
  console.log('\n🔍 Validation du backup...');
  
  const checks = [];
  
  // Check 1: Fichiers existent
  const requiredFiles = ['database.json', 'database.sql', 'manifest.json'];
  for (const f of requiredFiles) {
    const exists = fs.existsSync(path.join(backupDir, f));
    checks.push({ check: `Fichier ${f}`, pass: exists });
  }
  
  // Check 2: Counts cohérents
  const manifest = JSON.parse(fs.readFileSync(path.join(backupDir, 'manifest.json')));
  checks.push({ check: 'Total lignes > 0', pass: manifest.totalRows > 0 });
  checks.push({ check: 'affiliatecottages >= 100', pass: (counts.affiliatecottages || 0) >= 100 });
  checks.push({ check: 'articles > 0', pass: (counts.articles || 0) > 0 });
  checks.push({ check: 'pages > 0', pass: (counts.pages || 0) > 0 });
  checks.push({ check: 'site_settings > 0', pass: (counts.site_settings || 0) > 0 });
  checks.push({ check: 'library_images > 0', pass: (counts.library_images || 0) > 0 });
  
  // Check 3: JSON valide
  try {
    JSON.parse(fs.readFileSync(path.join(backupDir, 'database.json'), 'utf8'));
    checks.push({ check: 'database.json valide', pass: true });
  } catch { checks.push({ check: 'database.json valide', pass: false }); }
  
  // Check 4: SQL valide (basique)
  const sql = fs.readFileSync(path.join(backupDir, 'database.sql'), 'utf8');
  checks.push({ check: 'database.sql contient INSERT', pass: sql.includes('INSERT INTO') });
  
  // Afficher résultats
  let allPass = true;
  for (const c of checks) {
    const status = c.pass ? '✅' : '❌';
    console.log(`  ${status} ${c.check}`);
    if (!c.pass) allPass = false;
  }
  
  // Rapport
  const report = {
    timestamp: new Date().toISOString(),
    checks: checks.map(c => ({ name: c.check, pass: c.pass })),
    allPass,
    summary: { totalChecks: checks.length, passed: checks.filter(c => c.pass).length, failed: checks.filter(c => !c.pass).length }
  };
  fs.writeFileSync(path.join(backupDir, 'validation-report.json'), JSON.stringify(report, null, 2));
  
  if (allPass) {
    console.log('\n✅ TOUS LES CHECKS PASSENT');
  } else {
    console.log('\n⚠️ CERTAINS CHECKS ONT ÉCHOUÉ - Vérifiez validation-report.json');
  }
}

main().catch(e => {
  console.error('❌ ERREUR:', e.message);
  console.error(e.stack);
  process.exit(1);
});