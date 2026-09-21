/**
 * translate-pages-fr.js — creates FR sibling rows for EN pages (DeepL).
 *
 * Same i18n pattern as articles (migration 00004): FR rows share the slug
 * (locale='fr', translation_of=<en uuid>).
 * - Idempotent: skips slugs that already have an FR row.
 * - EN rows are never modified.
 * - NEVER translated (sent as-is, like code): shortcodes [a, b, 7],
 *   URLs, slugs, icons, image paths, and any key matching
 *   /(slug|url|link|href|image|icon|shortcode)/i.
 * - Glossary (VRBO, Expedia, Chalet Express) + {variables} protected.
 * - HTML fields use tag_handling=html (tags preserved natively).
 * - House post-rules: jacuzzi->spa (case-aware).
 *
 * Usage:
 *   node scripts/translate-pages-fr.js --dry-run
 *   node scripts/translate-pages-fr.js --limit=1
 *   node scripts/translate-pages-fr.js
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
// Object keys whose values are code/refs, never prose.
const SKIP_KEY_RE = /(slug|url|link|href|image|icon|shortcode|locale|translation_of|template|type)$/i;

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
    const base = m.toLowerCase().endsWith('s') && m.length > 7 ? plurTo : singTo;
    return /^[A-ZÀÂÉÈÊÎÔÛÇ]/.test(m) ? base[0].toUpperCase() + base.slice(1) : base;
  };
  const fixNoun = (m, singTo, plurTo) => {
    const base = /s$/i.test(m) ? plurTo : singTo;
    return /^[A-ZÀÂÉÈÊÎÔÛÇ]/.test(m) ? base[0].toUpperCase() + base.slice(1) : base;
  };
  // 'jacuzzis' (8 chars) vs 'jacuzzi' (7): length check keeps singular intact.
  r = r.replace(/jacuzzis/gi, (m) => fix(m, 'spa', 'spas'));
  r = r.replace(/jacuzzi/gi, (m) => fix(m, 'spa', 'spas'));
  // House style (Québec): "chalet(s)", never "gîte(s)".
  r = r.replace(/[Gg]îtes/g, (m) => fixNoun(m, 'chalet', 'chalets'));
  r = r.replace(/[Gg]îte/g, (m) => fixNoun(m, 'chalet', 'chalets'));
  r = r.replace(/\b[Cc]ottages in\b/g, (m) => (/^C/.test(m) ? 'Chalets à' : 'chalets à'));
  r = r.replace(/\b[Cc]ottages\b(?!\s+[Cc]ountry)/g, (m) => fixNoun(m, 'chalets', 'chalets'));
  r = r.replace(/\b[Cc]ottage\b(?!\s+[Cc]ountry)/g, (m) => fixNoun(m, 'chalet', 'chalets'));
  return r;
}
const R = (t) => postRules(restore(t));

// Flatten an object into [path, string] pairs, skipping code keys.
function collectStrings(obj, base, out) {
  if (typeof obj === 'string') {
    if (obj.trim() === '') return;
    // Short code tokens (AB, BC…) must stay verbatim — DeepL hallucinates
    // them ("MB" → "Mon frère").
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
      if (SKIP_KEY_RE.test(k)) continue;
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

function toJson(v, dflt) {
  if (v == null) return dflt;
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
}

// Top-level translatable columns (besides nested location_data).
const FLAT_FIELDS = ['title', 'content', 'seo_title', 'meta_description', 'image_alt',
  'cta_title', 'cta_button', 'cta_description', 'explore_title', 'explore_subtitle', 'explore_description'];

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
  const slugArg = process.argv.find((a) => a.startsWith('--slug='));
  const onlySlug = slugArg ? slugArg.split('=')[1] : null;
  if (force) console.log('Mode --force : les lignes FR existantes seront RÉGÉNÉRÉES (retouches manuelles FR perdues).');

  const client = new Client({ connectionString: conn });
  await client.connect();
  try {
    const { rows } = await client.query(
      `SELECT p.* FROM pages p
       WHERE p.locale = 'en'
         ${force ? '' : `AND NOT EXISTS (
           SELECT 1 FROM pages f
           WHERE f.locale = 'fr' AND f.translation_of = p.id
         )`}
         ${onlySlug ? `AND p.slug = '${onlySlug.replace(/'/g, "''")}'` : ''}
       ORDER BY p.created_at
       LIMIT $1`,
      [Number.isFinite(limit) ? limit : 1000000],
    );
    console.log(`${rows.length} page(s) EN sans version FR`);

    let totalChars = 0;
    let done = 0;
    for (const p of rows) {
      // Gather translatable strings: flat columns + nested JSON blobs.
      const jobs = []; // {kind, path?, value}
      for (const f of FLAT_FIELDS) {
        if (p[f] && String(p[f]).trim() !== '') jobs.push({ kind: 'flat', field: f, value: String(p[f]) });
      }
      const nestedBlobs = {};
      for (const f of ['faq', 'explore_items', 'location_data']) {
        const v = p[f];
        if (v == null || (typeof v === 'object' && Object.keys(v).length === 0)) continue;
        let parsed = v;
        if (typeof v === 'string') {
          try { parsed = JSON.parse(v); } catch { continue; }
        }
        const pairs = [];
        collectStrings(parsed, '', pairs);
        if (pairs.length) nestedBlobs[f] = { parsed, pairs };
      }
      const allTexts = [...jobs.map((j) => j.value)];
      const blobOffsets = {};
      for (const [f, { pairs }] of Object.entries(nestedBlobs)) {
        blobOffsets[f] = allTexts.length;
        for (const [, v] of pairs) allTexts.push(v);
      }
      const chars = allTexts.join('').length;
      totalChars += chars;
      if (dryRun) {
        const nestedCount = Object.values(nestedBlobs).reduce((n, b) => n + b.pairs.length, 0);
        console.log(`  [dry] ${p.slug} (~${chars} chars, flat=${jobs.length}, nested=${nestedCount})`);
        continue;
      }

      // Translate in batches of 40.
      const out = [];
      for (let i = 0; i < allTexts.length; i += 40) {
        const batch = allTexts.slice(i, i + 40).map(protect);
        const tr = await deepl(batch);
        out.push(...tr.map(R));
        await new Promise((r) => setTimeout(r, 1200));
      }
      const frFlat = {};
      jobs.forEach((j, i) => { frFlat[j.field] = out[i]; });
      const frNested = {};
      for (const [f, { parsed, pairs }] of Object.entries(nestedBlobs)) {
        const base = JSON.parse(JSON.stringify(parsed));
        pairs.forEach(([path], k) => setPath(base, path, out[blobOffsets[f] + k]));
        frNested[f] = base;
      }

      await client.query(
        `INSERT INTO pages
           (title, slug, template, content, seo_title, meta_description,
            featured_image, faq, cta_title, cta_button, cta_link, cta_description,
            explore_title, explore_subtitle, explore_description, explore_items,
            location_data, locale, translation_of,
            is_published, published_at, created_at)
         VALUES
           ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'fr',$18,$19,$20, CURRENT_TIMESTAMP)
         ON CONFLICT (slug, locale) DO UPDATE SET
           title = EXCLUDED.title, content = EXCLUDED.content,
           seo_title = EXCLUDED.seo_title, meta_description = EXCLUDED.meta_description,
           faq = EXCLUDED.faq, cta_title = EXCLUDED.cta_title,
           cta_button = EXCLUDED.cta_button, cta_description = EXCLUDED.cta_description,
           explore_title = EXCLUDED.explore_title, explore_subtitle = EXCLUDED.explore_subtitle,
           explore_description = EXCLUDED.explore_description, explore_items = EXCLUDED.explore_items,
           location_data = EXCLUDED.location_data, translation_of = EXCLUDED.translation_of,
           is_published = EXCLUDED.is_published, published_at = EXCLUDED.published_at,
           updated_at = CURRENT_TIMESTAMP`,
        [
          frFlat.title || p.title, p.slug, p.template, frFlat.content || p.content,
          frFlat.seo_title || null, frFlat.meta_description || null,
          p.featured_image,
          frNested.faq ? JSON.stringify(frNested.faq) : toJson(p.faq, '[]'),
          frFlat.cta_title || null, frFlat.cta_button || null, p.cta_link, frFlat.cta_description || null,
          frFlat.explore_title || null, frFlat.explore_subtitle || null, frFlat.explore_description || null,
          frNested.explore_items ? JSON.stringify(frNested.explore_items) : toJson(p.explore_items, '[]'),
          frNested.location_data ? JSON.stringify(frNested.location_data) : toJson(p.location_data, '{}'),
          p.id, p.isPublished ?? p.is_published ?? true, p.publishedAt || p.published_at || null,
        ],
      );
      done += 1;
      console.log(`  FR ${p.slug} (~${chars} chars)`);
    }
    console.log(dryRun ? 'Dry-run terminé.' : `Terminé: ${done} page(s), ~${totalChars.toLocaleString()} caractères soumis.`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('Erreur fatale:', e.message);
  process.exit(1);
});
