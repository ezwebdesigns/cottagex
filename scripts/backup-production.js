/**
 * Script de Backup Complet - Production Cottagex
 * Sauvegarde : Base de données (toutes tables) + Supabase Storage (images admin)
 * Usage : node scripts/backup-production.js
 * Prérequis : .env.production créé par `vercel env pull`
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
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
    console.error('❌ Fichier .env.production manquant. Lancez : vercel env pull .env.production');
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
  fs.mkdirSync(path.join(BACKUP_DIR, 'storage'), { recursive: true });
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
    totalRows: Object.values(counts).reduce((a, b) => a + b, 0),
    storage: {}
  };
  fs.writeFileSync(path.join(BACKUP_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  
  // 8. Supabase Storage Backup
  await backupStorage(BACKUP_DIR, manifest);
  
  // 8. Validation
  await validateBackup(BACKUP_DIR, counts);
  
  await pgClient.end();
  console.log('\n✅ BACKUP TERMINÉ AVEC SUCCÈS');
  console.log(`📁 Dossier : ${BACKUP_DIR}`);
  console.log(`📊 Total lignes : ${manifest.totalRows}`);
}

async function backupStorage(backupDir, manifest) {
  console.log('\n📦 Backup Supabase Storage...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('  ⚠️ Variables Supabase Storage manquantes (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
    console.log('  ℹ️ Ajoutez-les dans .env.production pour backup des images');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;
    
    for (const bucket of buckets) {
      console.log(`  📦 Bucket: ${bucket.name}`);
      const bucketDir = path.join(backupDir, 'storage', bucket.name);
      fs.mkdirSync(bucketDir, { recursive: true });
      
      const { data: files, error: filesError } = await supabase.storage.from(bucket.name).list('', { limit: 10000 });
      if (filesError) throw filesError;
      
      for (const file of files) {
        const { data: fileData, error: downloadError } = await supabase.storage.from(bucket.name).download(file.name);
        if (downloadError) {
          console.log(`    ⚠️ ${file.name}: ${downloadError.message}`);
          continue;
        }
        
        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filePath = path.join(bucketDir, file.name);
        fs.writeFileSync(filePath, buffer);
        console.log(`    ✅ ${file.name} (${(buffer.length/1024).toFixed(1)} KB)`);
        
        manifest.storage[`${bucket.name}/${file.name}`] = {
          size: buffer.length,
          bucket: bucket.name,
          name: file.name
        };
      }
    }
    console.log('✅ Storage backup terminé');
  } catch (e) {
    console.log(`  ⚠️ Storage backup échoué: ${e.message}`);
  }
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