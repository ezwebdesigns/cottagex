/**
 * translate-seo-meta.js — fills the FR blocks of src/lib/seo-meta.ts via DeepL.
 *
 * Only fills EMPTY fr strings (existing translations are preserved).
 * Format contract with seo-meta.ts: single-line
 *   en: { title: "...", description: "..." }
 *   fr: { title: "...", description: "..." }
 * blocks, paired in order.
 *
 * Usage:
 *   node scripts/translate-seo-meta.js --dry-run   # preview
 *   node scripts/translate-seo-meta.js              # translate + write
 */
const fs = require('fs');

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
if (!DEEPL_API_KEY) {
  console.error('DEEPL_API_KEY manquant dans .env.local');
  process.exit(1);
}
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

const GLOSSARY = new Set(['VRBO', 'Expedia', 'Chalet Express']);

function protectGlossary(text) {
  let result = text;
  for (const term of GLOSSARY) {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    result = result.replace(regex, `__GLOSSARY_${term}__`);
  }
  return result;
}
function restoreGlossary(text) {
  let result = text;
  for (const term of GLOSSARY) {
    result = result.replace(new RegExp(`__GLOSSARY_${term}__`, 'gi'), term);
  }
  return result;
}
function escapeTs(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function translateBatch(texts) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: texts, target_lang: 'FR', preserve_formatting: true }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`DeepL HTTP ${response.status}`);
    const data = await response.json();
    return data.translations.map((t) => t.text);
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const path = 'src/lib/seo-meta.ts';
  const src = fs.readFileSync(path, 'utf8');

  const enRe = /en: \{ title: "((?:[^"\\]|\\.)*)", description: "((?:[^"\\]|\\.)*)" \}/g;
  const frRe = /fr: \{ title: "((?:[^"\\]|\\.)*)", description: "((?:[^"\\]|\\.)*)" \}/g;
  const enBlocks = [...src.matchAll(enRe)];
  const frBlocks = [...src.matchAll(frRe)];

  if (enBlocks.length !== frBlocks.length || enBlocks.length === 0) {
    console.error(`Format inattendu: ${enBlocks.length} blocs en / ${frBlocks.length} blocs fr`);
    process.exit(1);
  }

  // Collect empty FR slots, paired by order.
  const jobs = [];
  for (let i = 0; i < enBlocks.length; i++) {
    const [, enTitle, enDesc] = enBlocks[i];
    const frFull = frBlocks[i][0];
    if (/fr: \{ title: "", description: "" \}/.test(frFull)) {
      jobs.push({ index: i, enTitle, enDesc });
    }
  }
  console.log(`${jobs.length} bloc(s) FR à traduire sur ${enBlocks.length}`);

  let content = src;

  if (dryRun) {
    for (const j of jobs) console.log(`  - "${j.enTitle}"`);
    console.log('Dry-run terminé.');
    return;
  }

  for (const j of jobs) {
    const [frTitle, frDesc] = await translateBatch([
      protectGlossary(j.enTitle),
      protectGlossary(j.enDesc),
    ]);
    const frLine = `fr: { title: "${escapeTs(restoreGlossary(frTitle))}", description: "${escapeTs(restoreGlossary(frDesc))}" }`;
    // Replace the i-th EMPTY fr block occurrence in the current content.
    let seen = -1;
    content = content.replace(
      /fr: \{ title: "", description: "" \}/g,
      (m) => {
        seen += 1;
        return seen === 0 ? frLine : m;
      },
    );
    // jobs were collected in order, so the first remaining empty block is ours.
    console.log(`  Traduit: "${j.enTitle}"`);
    await new Promise((r) => setTimeout(r, 1200));
  }
  fs.writeFileSync(path, content);
  console.log('Fichier mis à jour: src/lib/seo-meta.ts');
}

main().catch((e) => {
  console.error('Erreur fatale:', e.message);
  process.exit(1);
});
