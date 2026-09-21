/**
 * translate-articles-fr.js — creates FR sibling rows for EN articles (DeepL).
 *
 * Design: FR rows share the SAME slug (locale='fr', translation_of=<en id>),
 * so /en/guides/<slug> and /fr/guides/<slug> stay aligned (migration 00003).
 * - Idempotent: skips slugs that already have an FR row.
 * - EN rows are never modified.
 * - HTML content is sent with tag_handling=html (DeepL preserves tags
 *   natively — safer and cheaper than base64-wrapping tags).
 * - Glossary (VRBO, Expedia, Chalet Express) + {variables} protected.
 * - category/author kept as-is (stable taxonomy + byline).
 *
 * Usage:
 *   node scripts/translate-articles-fr.js --dry-run
 *   node scripts/translate-articles-fr.js --limit=1   # canary: 1 article
 *   node scripts/translate-articles-fr.js             # all missing
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
// Shortcode shape (ArticleStandard.tsx / ArticleListicle.tsx). NEVER translated:
// params are slugs/category keys/limits, and any case/accent change breaks them.
const SHORTCODE_RE = /\[([a-z0-9-]+),\s*([a-z0-9-]+)(?:,\s*([a-z0-9-]+))?(?:,\s*(\d+))?\]/g;
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
  // DeepL HTML-escapes quotes/apostrophes (&#x27; etc.) — decode them
  // (&amp; last to avoid double-decoding).
  result = result
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  return result;
}

// Post-rules: DeepL renders listicle superlatives ("les 7 meilleurs…") and
// the "jacuzzi" brand where house style wants a plain "7 …" selection
// with "spa". Applied to every FR field after restore.
function repWord(s, singular, plural, singTo, plurTo) {
  const fix = (m) => {
    const cap = m[0] === m[0].toUpperCase() && /[A-ZÀÂÉÈÊÎÔÛÇ]/.test(m[0]);
    const base = m.toLowerCase() === plural.toLowerCase() ? plurTo : singTo;
    return cap ? base[0].toUpperCase() + base.slice(1) : base;
  };
  return s
    .replace(new RegExp(plural, 'gi'), fix)
    .replace(new RegExp(singular, 'gi'), fix);
}
function postRules(s) {
  let r = String(s ?? '');
  r = repWord(r, 'jacuzzi', 'jacuzzis', 'spa', 'spas');
  r = r.replace(/les mieux notées/gi, 'sélectionnées avec soin');
  r = r.replace(/les mieux notés/gi, 'sélectionnés avec soin');
  r = r.replace(/[Ll]es 7 meilleurs?(?:es)? /g, '7 ');
  r = r.replace(/[Ll]es (7 (?:[^<.]*?)sélectionné(?:e)?s)/gi, '$1');
  // House style (Québec): "chalet(s)", never "gîte(s)".
  const fixNoun = (m, singTo, plurTo) => {
    const base = /s$/i.test(m) ? plurTo : singTo;
    return /^[A-ZÀÂÉÈÊÎÔÛÇ]/.test(m) ? base[0].toUpperCase() + base.slice(1) : base;
  };
  r = r.replace(/[Gg]îtes/g, (m) => fixNoun(m, 'chalet', 'chalets'));
  r = r.replace(/[Gg]îte/g, (m) => fixNoun(m, 'chalet', 'chalets'));
  r = r.replace(/\b[Cc]ottages in\b/g, (m) => (/^C/.test(m) ? 'Chalets à' : 'chalets à'));
  r = r.replace(/\b[Cc]ottages\b(?!\s+[Cc]ountry)/g, (m) => fixNoun(m, 'chalets', 'chalets'));
  r = r.replace(/\b[Cc]ottage\b(?!\s+[Cc]ountry)/g, (m) => fixNoun(m, 'chalet', 'chalets'));
  return r;
}

// Hand-curated FR metas per slug (titles/excerpts/seo). Overrides the raw
// DeepL output for listicles + known defects (e.g. PEI title repetition,
// luxury-quebec SEO copied from another article in prod source data).
const META_OVERRIDES = {
  '7-best-cottage-rentals-in-muskoka': {
    title: '7 locations de chalets à Muskoka pour 2026',
    excerpt: 'Découvrez 7 locations de chalets à Muskoka pour 2026 : avis de voyageurs vérifiés, annonces authentiques et conseils pour votre escapade au bord du lac.',
    seo_title: '7 locations de chalets à Muskoka pour 2026 (disponibles sur VRBO)',
  },
  '7-best-family-cottage-rentals-in-ontario': {
    title: '7 chalets familiaux en Ontario (enfants et animaux acceptés)',
    excerpt: "Découvrez 7 chalets familiaux en Ontario : adaptés aux enfants, animaux acceptés et expériences validées par de vraies familles. Réservez votre escapade d'été.",
    seo_title: '7 locations de chalets familiaux en Ontario (enfants et animaux acceptés)',
  },
  '7-luxury-cottage-rentals-ontario-hot-tub': {
    title: '7 chalets luxueux en Ontario avec spa (2026)',
    excerpt: "Découvrez 7 chalets luxueux en Ontario avec spa : vue sur l'eau, équipements haut de gamme et avis vérifiés. Réservez votre escapade.",
    seo_title: '7 chalets luxueux en Ontario avec spa (2026)',
  },
  '7-best-chalet-rentals-mont-tremblant': {
    title: '7 chalets à louer près de Mont-Tremblant',
    excerpt: 'Découvrez 7 chalets à louer près de Mont-Tremblant : ski au pied des pistes ou bord de lac, avis vérifiés et conseils pour un séjour parfait.',
    seo_title: '7 locations de chalets près de Mont-Tremblant (accès skis aux pieds et bord du lac)',
  },
  '7-luxury-chalets-quebec-hot-tub': {
    title: '7 chalets luxueux au Québec avec spa (disponibles dès maintenant)',
    excerpt: 'Découvrez 7 chalets luxueux au Québec avec spa : vue sur la montagne, équipements haut de gamme et avis vérifiés. Réservez votre escapade de rêve.',
    seo_title: '7 chalets luxueux au Québec avec spa (disponibles dès maintenant)',
  },
  'pei-cottage-rentals': {
    title: "Locations de chalets à l'Île-du-Prince-Édouard : plages de sable rouge et bord de mer",
    seo_title: "Locations de chalets à l'Île-du-Prince-Édouard : plages de sable rouge et escapades en bord de mer",
  },
};

async function deepl(texts, isHtml) {
  const body = { text: texts, target_lang: 'FR', preserve_formatting: true };
  if (isHtml) body.tag_handling = 'html';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
  const slugArg = process.argv.find((a) => a.startsWith('--slug='));
  const onlySlug = slugArg ? slugArg.split('=')[1] : null;
  if (force) console.log('Mode --force : les lignes FR existantes seront RÉGÉNÉRÉES (retouches manuelles FR perdues).');

  const client = new Client({ connectionString: conn });
  await client.connect();
  try {
    const { rows } = await client.query(
      `SELECT a.* FROM articles a
       WHERE a.locale = 'en'
         ${force ? '' : `AND NOT EXISTS (
           SELECT 1 FROM articles f
           WHERE f.locale = 'fr' AND f.translation_of = a.id
         )`}
         ${onlySlug ? `AND a.slug = '${onlySlug.replace(/'/g, "''")}'` : ''}
       ORDER BY a.id
       LIMIT $1`,
      [Number.isFinite(limit) ? limit : 1000000],
    );
    console.log(`${rows.length} article(s) EN sans version FR`);

    let totalChars = 0;
    let done = 0;
    for (const a of rows) {
      const faq = Array.isArray(a.faq) ? a.faq : [];
      // Order matters: restored positionally below.
      const plain = [
        a.title,
        a.excerpt || '',
        a.seo_title || '',
        a.seo_keywords || '',
        a.image_alt || '',
        a.cta_title || '',
        a.cta_button || '',
        ...faq.flatMap((f) => [f.question || '', f.answer || '']),
      ];
      const html = [a.content || ''];
      const chars = plain.join('').length + html.join('').length;
      totalChars += chars;

      if (dryRun) {
        console.log(`  [dry] #${a.id} ${a.slug} (~${chars} chars, faq=${faq.length})`);
        continue;
      }

      const [tTitle, tExcerpt, tSeoTitle, tSeoKw, tAlt, tCtaT, tCtaB, ...tFaq] = await deepl(
        plain.map(protect), false,
      );
      const [tContent] = await deepl(html.map(protect), true);
      const R = (t) => postRules(restore(t));
      const frFaq = faq.map((_, i) => ({
        question: R(tFaq[i * 2] || ''),
        answer: R(tFaq[i * 2 + 1] || ''),
      }));
      // Hand-curated metas win over raw DeepL output (listicle nuance, etc.).
      const ov = META_OVERRIDES[a.slug] || {};

      await client.query(
        `INSERT INTO articles
           (title, slug, type, content, excerpt, category, author,
            featured_image, image_alt, seo_title, seo_keywords,
            locale, translation_of, faq,
            cta_title, cta_button, cta_link,
            is_published, published_at, created_at)
         VALUES
           ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'fr',$12,$13,$14,$15,$16,$17,$18, CURRENT_TIMESTAMP)
         ON CONFLICT (slug, locale) DO UPDATE SET
           title = EXCLUDED.title, content = EXCLUDED.content,
           excerpt = EXCLUDED.excerpt, image_alt = EXCLUDED.image_alt,
           seo_title = EXCLUDED.seo_title, seo_keywords = EXCLUDED.seo_keywords,
           faq = EXCLUDED.faq, cta_title = EXCLUDED.cta_title,
           cta_button = EXCLUDED.cta_button, cta_link = EXCLUDED.cta_link,
           is_published = EXCLUDED.is_published, published_at = EXCLUDED.published_at,
           updated_at = CURRENT_TIMESTAMP`,
        [
          ov.title || R(tTitle), a.slug, a.type, R(tContent), ov.excerpt || R(tExcerpt), a.category, a.author,
          a.featured_image, R(tAlt), ov.seo_title || R(tSeoTitle), R(tSeoKw),
          a.id, JSON.stringify(frFaq), R(tCtaT), R(tCtaB), a.cta_link,
          a.is_published, a.published_at,
        ],
      );
      done += 1;
      console.log(`  FR #${a.id} ${a.slug} (~${chars} chars)`);
      await new Promise((r) => setTimeout(r, 1200));
    }
    console.log(dryRun ? 'Dry-run terminé.' : `Terminé: ${done} article(s), ~${totalChars.toLocaleString()} caractères soumis.`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('Erreur fatale:', e.message);
  process.exit(1);
});
