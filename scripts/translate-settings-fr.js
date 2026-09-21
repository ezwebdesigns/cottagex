/**
 * translate-settings-fr.js — creates FR sibling rows for EN site_settings (DeepL).
 *
 * Same i18n pattern as articles/pages: FR rows share the `section`
 * (locale='fr'), merged at read time by getAllSettings(locale) with EN fallback.
 * - Idempotent: skips sections that already have an FR row.
 * - EN rows are never modified.
 * - NEVER translated (sent as-is): shortcodes [a, b, 7], lib:NN refs, URLs,
 *   slugs, icons, image paths, and any key matching
 *   /(slug|url|link|href|image|icon|shortcode|locale|template|type)$/i
 *   plus *Fr keys (already-translated manual fields, e.g. labelFr).
 * - Glossary (VRBO, Expedia, Chalet Express) + {variables} protected.
 * - HTML fields use tag_handling=html (tags preserved natively).
 * - House post-rules: jacuzzi->spa (case-aware).
 *
 * Usage:
 *   node scripts/translate-settings-fr.js --dry-run
 *   node scripts/translate-settings-fr.js --limit=2
 *   node scripts/translate-settings-fr.js
 *
 * Env: DATABASE_URL must be LOCAL, DEEPL_API_KEY required.
 */
const { Client } = require('pg');

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
if (!DEEPL_API_KEY) {
  console.error('DEEPL_API_KEY manquant (ex: node --env-file=.env.local ...)');
  process.exit(1);
}
const conn = process.env.DATABASE_URL || '';
if (!/127\.0\.0\.1|localhost/.test(conn)) {
  console.error('REFUSING: DATABASE_URL is not local.');
  process.exit(1);
}

const GLOSSARY = new Set(['VRBO', 'Expedia', 'Chalet Express']);
const SHORTCODE_RE = /\[([a-z0-9-]+),\s*([a-z0-9-]+)(?:,\s*([a-z0-9-]+))?(?:,\s*(\d+))?\]/g;
const SKIP_KEY_RE = /(slug|url|link|href|image|icon|shortcode|locale|template|type|script|html|embed|code)$/i;
const ALREADY_FR_RE = /Fr$/;

function protect(text) {
  let result = String(text ?? '');
  for (const term of GLOSSARY) {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    result = result.replace(regex, `__GLOSSARY_${term}__`);
  }
  result = result.replace(/\{[a-zA-Z0-9._-]+\}/g, (m) => `__VAR_${m.slice(1, -1)}__`);
  result = result.replace(SHORTCODE_RE, (m) => `__SC_${Buffer.from(m).toString('base64')}__`);
  return result;
}
// Inline code spans ({vars}, lib:NN) use INDEXED placeholders (__V0__, …).
// Rationale: word-like placeholders (__VAR_locale__, __LIB_64__) get
// translated/mangled by DeepL ("LIB" → "Bibliothèque"); bare indexes survive.
function protectVars(text) {
  const vars = [];
  const out = String(text ?? '').replace(/\{[a-zA-Z0-9._-]+\}|\blib:\d+\b/g, (m) => {
    vars.push(m);
    return `__V${vars.length - 1}__`;
  });
  return { text: out, vars };
}
function restoreVars(text, vars) {
  return String(text ?? '').replace(/__V(\d+)__/g, (_, n) =>
    vars[Number(n)] !== undefined ? vars[Number(n)] : `__V${n}__`,
  );
}
function restore(text) {
  let result = String(text ?? '');
  for (const term of GLOSSARY) {
    result = result.replace(new RegExp(`__GLOSSARY_${term}__`, 'gi'), term);
  }
  result = result.replace(/__VAR_([^_]+)__/g, '{$1}');
  result = result.replace(/__SC_([A-Za-z0-9+/=]+)__/g, (_, b64) => Buffer.from(b64, 'base64').toString());
  result = result
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  return result;
}
function postRules(s) {
  let r = String(s ?? '');
  const fix = (m, singTo, plurTo) => {
    const base = m.toLowerCase() === 'jacuzzis' ? plurTo : singTo;
    return /^[A-ZÀÂÉÈÊÎÔÛÇ]/.test(m) ? base[0].toUpperCase() + base.slice(1) : base;
  };
  const fixNoun = (m, singTo, plurTo) => {
    const base = /s$/i.test(m) ? plurTo : singTo;
    return /^[A-ZÀÂÉÈÊÎÔÛÇ]/.test(m) ? base[0].toUpperCase() + base.slice(1) : base;
  };
  r = r.replace(/jacuzzis/gi, (m) => fix(m, 'spa', 'spas'));
  r = r.replace(/jacuzzi/gi, (m) => fix(m, 'spa', 'spas'));
  // House style (Québec): "chalet(s)", never "gîte(s)".
  r = r.replace(/[Gg]îtes/g, (m) => fixNoun(m, 'chalet', 'chalets'));
  r = r.replace(/[Gg]îte/g, (m) => fixNoun(m, 'chalet', 'chalets'));
  // Standalone "Cottages in X" links and prose (not the "Cottage Country"
  // compound, not URLs — those are skipped at collect time).
  r = r.replace(/\b[Cc]ottages in\b/g, (m) => (/^C/.test(m) ? 'Chalets à' : 'chalets à'));
  r = r.replace(/\b[Cc]ottages\b(?!\s+[Cc]ountry)/g, (m) => fixNoun(m, 'chalets', 'chalets'));
  r = r.replace(/\b[Cc]ottage\b(?!\s+[Cc]ountry)/g, (m) => fixNoun(m, 'chalet', 'chalets'));
  return r;
}
const R = (t) => postRules(restore(t));

function collectStrings(obj, base, out) {
  if (typeof obj === 'string') {
    if (obj.trim() === '') return;
    // Province codes and similar short tokens (AB, BC, MB…) must stay
    // verbatim — DeepL hallucinates them ("MB" → "Mon frère").
    if (/^[A-Z0-9]{1,4}$/.test(obj.trim())) return;
    out.push([base, obj]);
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => collectStrings(v, `${base}[${i}]`, out));
    return;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (SKIP_KEY_RE.test(k) || ALREADY_FR_RE.test(k)) continue;
      collectStrings(v, base ? `${base}.${k}` : k, out);
    }
  }
}
function setPath(root, path, value) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter((p) => p !== '');
  let o = root;
  for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
  o[parts[parts.length - 1]] = value;
}
function toJson(v, dflt) {
  if (v == null) return dflt;
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
}

async function deepl(texts) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: texts, target_lang: 'FR', preserve_formatting: true, tag_handling: 'html' }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`DeepL HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    return data.translations.map((t) => t.text);
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
  const sectionArg = process.argv.find((a) => a.startsWith('--section='));
  const onlySection = sectionArg ? sectionArg.split('=')[1] : null;
  if (force) console.log('Mode --force : les lignes FR existantes seront RÉGÉNÉRÉES (retouches manuelles FR perdues).');

  const client = new Client({ connectionString: conn });
  await client.connect();
  try {
    const { rows } = await client.query(
      `SELECT s.section, s.data FROM site_settings s
       WHERE s.locale = 'en'
         AND (
           ${force ? 'TRUE' : `NOT EXISTS (
             SELECT 1 FROM site_settings f
             WHERE f.locale = 'fr' AND f.section = s.section
           )`}
           ${onlySection ? `AND s.section = '${onlySection.replace(/'/g, "''")}'` : ''}
         )
       ORDER BY s.section
       LIMIT $1`,
      [Number.isFinite(limit) ? limit : 1000000],
    );
    console.log(`${rows.length} section(s) EN sans version FR`);

    let totalChars = 0;
    let done = 0;
    for (const s of rows) {
      let parsed = s.data;
      if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch { continue; }
      }
      const pairs = [];
      collectStrings(parsed, '', pairs);
      const chars = pairs.map(([, v]) => v).join('').length;
      totalChars += chars;
      if (dryRun) {
        console.log(`  [dry] ${s.section} (~${chars} chars, ${pairs.length} strings)`);
        continue;
      }
      const base = JSON.parse(JSON.stringify(parsed));
      for (let i = 0; i < pairs.length; i += 40) {
        const batch = pairs.slice(i, i + 40);
        const protectedBatch = batch.map(([, v]) => protectVars(protect(v)));
        const tr = await deepl(protectedBatch.map((p) => p.text));
        batch.forEach(([path], k) =>
          setPath(base, path, R(restoreVars(tr[k], protectedBatch[k].vars))),
        );
        await new Promise((r) => setTimeout(r, 1200));
      }
      await client.query(
        `INSERT INTO site_settings (section, data, locale) VALUES ($1, $2, 'fr')
         ON CONFLICT (section, locale) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
        [s.section, JSON.stringify(base)],
      );
      done += 1;
      console.log(`  FR ${s.section} (~${chars} chars)`);
    }
    console.log(dryRun ? 'Dry-run terminé.' : `Terminé: ${done} section(s), ~${totalChars.toLocaleString()} caractères soumis.`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('Erreur fatale:', e.message);
  process.exit(1);
});
