import { redis } from './cache';

// Monthly DeepL budget guard (free tier: 500_000 chars/month).
// Counts submitted characters in Redis; blocks translation past the cap
// instead of silently burning quota. Admin saves are rare, so a shared
// counter is plenty (no per-user tracking needed).
const MONTHLY_CHAR_CAP = 400_000;

function monthKey(): string {
  const d = new Date();
  return `deepl:chars:${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function deeplCharsUsedThisMonth(): Promise<number> {
  try {
    const v = await redis.get<number>(monthKey());
    return typeof v === 'number' ? v : 0;
  } catch {
    return 0;
  }
}

const GLOSSARY = new Set(['VRBO', 'Expedia', 'Chalet Express']);
const SHORTCODE_RE = /\[([a-z0-9-]+),\s*([a-z0-9-]+)(?:,\s*([a-z0-9-]+))?(?:,\s*(\d+))?\]/g;
const SKIP_KEY_RE = /(slug|url|link|href|image|icon|shortcode|locale|template|type|script|html|embed|code)$/i;

function protect(text: string): string {
  let result = String(text ?? '');
  for (const term of GLOSSARY) {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    result = result.replace(regex, `__GLOSSARY_${term}__`);
  }
  result = result.replace(SHORTCODE_RE, (m) => `__SC_${Buffer.from(m).toString('base64')}__`);
  return result;
}

function protectVars(text: string): { text: string; vars: string[] } {
  const vars: string[] = [];
  const out = String(text ?? '').replace(/\{[a-zA-Z0-9._-]+\}|\blib:\d+\b/g, (m) => {
    vars.push(m);
    return `__V${vars.length - 1}__`;
  });
  return { text: out, vars };
}

function restoreVars(text: string, vars: string[]): string {
  return String(text ?? '').replace(/__V(\d+)__/g, (_, n) =>
    vars[Number(n)] !== undefined ? vars[Number(n)] : `__V${n}__`,
  );
}

function restore(text: string): string {
  let result = String(text ?? '');
  for (const term of GLOSSARY) {
    result = result.replace(new RegExp(`__GLOSSARY_${term}__`, 'gi'), term);
  }
  result = result.replace(/__SC_([A-Za-z0-9+/=]+)__/g, (_, b64) => Buffer.from(b64, 'base64').toString());
  result = result
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  return result;
}

function cap(m: string, base: string): string {
  return /^[A-ZÀÂÉÈÊÎÔÛÇ]/.test(m) ? base[0].toUpperCase() + base.slice(1) : base;
}

function postRules(s: string): string {
  let r = String(s ?? '');
  r = r.replace(/jacuzzis/gi, (m) => cap(m, m.toLowerCase() === 'jacuzzis' ? 'spas' : 'spa'));
  r = r.replace(/jacuzzi/gi, (m) => cap(m, 'spa'));
  r = r.replace(/[Gg]îtes/g, (m) => cap(m, 'chalets'));
  r = r.replace(/[Gg]îte/g, (m) => cap(m, 'chalet'));
  r = r.replace(/\b[Cc]ottages in\b/g, (m) => (/^C/.test(m) ? 'Chalets à' : 'chalets à'));
  r = r.replace(/\b[Cc]ottages\b(?!\s+[Cc]ountry)/g, (m) => cap(m, 'chalets'));
  r = r.replace(/\b[Cc]ottage\b(?!\s+[Cc]ountry)/g, (m) => cap(m, 'chalet'));
  return r;
}

const R = (t: string, vars: string[]) => postRules(restore(restoreVars(t, vars)));

function collectStrings(obj: unknown, base: string, out: [string, string][]): void {
  if (typeof obj === 'string') {
    if (obj.trim() === '') return;
    if (/^[A-Z0-9]{1,4}$/.test(obj.trim())) return; // codes (AB, MB…) stay verbatim
    out.push([base, obj]);
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => collectStrings(v, `${base}[${i}]`, out));
    return;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (SKIP_KEY_RE.test(k) || /Fr$/.test(k)) continue;
      collectStrings(v, base ? `${base}.${k}` : k, out);
    }
  }
}

function setPath(root: any, path: string, value: string): void {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter((p) => p !== '');
  let o = root;
  for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
  o[parts[parts.length - 1]] = value;
}

async function deeplBatch(texts: string[], apiKey: string): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: texts, target_lang: 'FR', preserve_formatting: true, tag_handling: 'html' }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`DeepL HTTP ${res.status}`);
    const data = await res.json();
    return (data.translations || []).map((t: any) => t.text);
  } finally {
    clearTimeout(timer);
  }
}

export type AutoTranslateResult = { ok: boolean; chars?: number; skipped?: string };

/**
 * Translates a settings section data object EN → FR.
 * Enforces the monthly budget BEFORE calling DeepL; on any failure
 * returns { ok: false } and the caller keeps serving EN fallback.
 */
export async function translateSettingsData(data: unknown): Promise<{ data: unknown; result: AutoTranslateResult }> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) return { data, result: { ok: false, skipped: 'no-key' } };
  const pairs: [string, string][] = [];
  collectStrings(data, '', pairs);
  if (pairs.length === 0) return { data, result: { ok: true, chars: 0 } };

  const protectedBatch = pairs.map(([, v]) => protectVars(protect(v)));
  const chars = protectedBatch.map((p) => p.text).join('').length;
  const used = await deeplCharsUsedThisMonth();
  if (used + chars > MONTHLY_CHAR_CAP) {
    return { data, result: { ok: false, skipped: 'budget' } };
  }

  const base = JSON.parse(JSON.stringify(data));
  for (let i = 0; i < protectedBatch.length; i += 40) {
    const batch = protectedBatch.slice(i, i + 40);
    const tr = await deeplBatch(batch.map((p) => p.text), apiKey);
    batch.forEach((p, k) => {
      const path = pairs[i + k][0];
      setPath(base, path, R(tr[k] ?? '', p.vars));
    });
    await new Promise((r) => setTimeout(r, 1200));
  }
  try {
    await redis.incrby(monthKey(), chars);
    await redis.expire(monthKey(), 45 * 24 * 3600);
  } catch {}
  return { data: base, result: { ok: true, chars } };
}
