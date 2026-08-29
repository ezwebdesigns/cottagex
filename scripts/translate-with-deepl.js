const fs = require('fs');
const axios = require('axios');

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
if (!DEEPL_API_KEY) {
  console.error('❌ DEEPL_API_KEY manquant dans .env.local');
  process.exit(1);
}
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

// Glossaire termes fixes (ne pas traduire)
const GLOSSARY = new Set([
  'VRBO',
  'Expedia',
  'Chalet Express',
  'Cottage Country'
]);

// Patterns à protéger
const ICU_PATTERN = /\{[^}]+,\s*plural\s*,/;
const VARIABLE_PATTERN = /\{[a-zA-Z0-9._-]+\}/g;
const HTML_TAG_PATTERN = /<[^>]+>/g;

function shouldTranslate(value) {
  if (typeof value !== 'string') return false;
  if (value.trim() === '') return false;
  if (ICU_PATTERN.test(value)) return false;
  return true;
}

function protectVariables(text) {
  return text.replace(VARIABLE_PATTERN, (match) => `__VAR_${match.slice(1, -1)}__`);
}

function protectHtmlTags(text) {
  return text.replace(HTML_TAG_PATTERN, (match) => `__HTML_${Buffer.from(match).toString('base64')}__`);
}

function protectGlossary(text) {
  let result = text;
  for (const term of GLOSSARY) {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    result = result.replace(regex, `__GLOSSARY_${term}__`);
  }
  return result;
}

function sanitizeForTranslation(text) {
  let result = text;
  result = protectGlossary(result);
  result = protectVariables(result);
  result = protectHtmlTags(result);
  return result;
}

function restoreAll(text) {
  let result = text;
  for (const term of GLOSSARY) {
    result = result.replace(new RegExp(`__GLOSSARY_${term}__`, 'gi'), term);
  }
  result = result.replace(/__VAR_([^_]+)__/g, '{$1}');
  result = result.replace(/__HTML_([^_]+)__/g, (_, b64) => Buffer.from(b64, 'base64').toString());
  return result;
}

function flatten(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(result, flatten(item, `${newKey}[${index}]`));
        } else if (typeof item === 'string' && shouldTranslate(item)) {
          result[`${newKey}[${index}]`] = item;
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flatten(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

function unflatten(flat) {
  const result = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.replace(/\[(\d+)\]/g, '.$1').split('.');
    let obj = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const next = parts[i + 1];
      const isNextIndex = /^\d+$/.test(next);
      if (obj[part] === undefined) {
        obj[part] = isNextIndex ? [] : {};
      }
      obj = obj[part];
    }
    obj[parts[parts.length - 1]] = value;
  }
  return result;
}

async function translateBatch(texts, targetLang = 'FR') {
  const response = await axios.post(DEEPL_API_URL, {
    text: texts,
    target_lang: targetLang,
    preserve_formatting: true
  }, {
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });
  return response.data.translations.map(t => t.text);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('🔄 Traduction EN → FR via DeepL API');
  console.log(`Mode: ${dryRun ? 'DRY-RUN (simulation)' : 'RÉEL'}`);
  console.log('Glossaire protégé:', [...GLOSSARY].join(', '));
  console.log('');

  const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
  const fr = JSON.parse(fs.readFileSync('messages/fr.json', 'utf8'));

  const flatEn = flatten(en);

  const toTranslate = [];
  const keysToTranslate = [];

  for (const [key, enValue] of Object.entries(flatEn)) {
    if (!shouldTranslate(enValue)) continue;
    toTranslate.push(enValue);
    keysToTranslate.push(key);
  }

  console.log(`\n📊 ${toTranslate.length} clés à traiter sur ${Object.keys(flatEn).length} totales`);
  console.log('');

  if (dryRun) {
    console.log('\n🔍 DRY-RUN - Aperçu des traductions (premières 10):');
    for (let i = 0; i < Math.min(10, toTranslate.length); i++) {
      console.log(`  ${keysToTranslate[i]}: "${toTranslate[i].substring(0, 80)}..."`);
    }
    if (toTranslate.length > 10) console.log(`  ... et ${toTranslate.length - 10} autres`);
    console.log('\n✅ Dry-run terminé. Lance sans --dry-run pour appliquer.');
    return;
  }

  const batchSize = 40;
  const flatFr = flatten(fr);
  let totalChars = 0;

  for (let i = 0; i < toTranslate.length; i += batchSize) {
    const batch = toTranslate.slice(i, i + batchSize);
    const keysBatch = keysToTranslate.slice(i, i + batchSize);

    const sanitizedBatch = batch.map(t => sanitizeForTranslation(t));
    totalChars += sanitizedBatch.join('').length;

    console.log(`  📦 Batch ${Math.floor(i/batchSize)+1}/${Math.ceil(toTranslate.length/batchSize)} (${batch.length} items)...`);

    try {
      const translations = await translateBatch(sanitizedBatch);

      for (let j = 0; j < translations.length; j++) {
        flatFr[keysBatch[j]] = restoreAll(translations[j]);
      }

      await new Promise(r => setTimeout(r, 1200));
    } catch (error) {
      console.error(`  ❌ Erreur batch ${Math.floor(i/batchSize)+1}:`, error.message);
      for (let j = 0; j < batch.length; j++) {
        flatFr[keysBatch[j]] = batch[j];
      }
    }
  }

  const frUpdated = unflatten(flatFr);
  fs.writeFileSync('messages/fr.json', JSON.stringify(frUpdated, null, 2));

  console.log(`\n✅ Traduction terminée !`);
  console.log(`   Caractères traduits: ~${totalChars.toLocaleString()}`);
  console.log(`   Fichier mis à jour: messages/fr.json`);
}

main().catch(e => {
  console.error('❌ Erreur fatale:', e.message);
  process.exit(1);
});
