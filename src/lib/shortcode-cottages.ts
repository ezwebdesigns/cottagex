import { getCottages } from './cottages';

const shortcodeRegex =
  /\[([a-z0-9-]+),\s*([a-z0-9-]+)(?:,\s*([a-z0-9-]+))?(?:,\s*(\d+))?(?:,\s*(cards|grid|list))?\]/g;

const LAYOUT_TOKENS = new Set(['cards', 'grid', 'list']);

export type ShortcodeLayout = 'list' | 'cards';

export interface ShortcodeParams {
  param1: string;
  param2: string;
  param3?: string;
  limit?: number;
  layout?: ShortcodeLayout;
}

function normalizeParams(
  param1: string,
  param2: string,
  param3: string | undefined,
  limitStr: string | undefined,
  layoutStr: string | undefined,
): ShortcodeParams {
  // Même règle que dans les templates : un 3e segment numérique
  // (ex. [ontario, rating, 6]) est le LIMIT, pas une catégorie.
  let p3: string | undefined = param3;
  let limit: number | undefined = limitStr ? parseInt(limitStr, 10) : undefined;
  if (limit === undefined && p3 && /^\d+$/.test(p3)) {
    limit = parseInt(p3, 10);
    p3 = undefined;
  }
  // Un segment textuel non numérique en position 3 peut être le layout
  // (ex. [ontario, rating, cards]).
  let layout: ShortcodeLayout = 'list';
  if (layoutStr === 'cards' || layoutStr === 'grid') layout = 'cards';
  else if (layoutStr === 'list') layout = 'list';
  else if (p3 && LAYOUT_TOKENS.has(p3)) {
    layout = p3 === 'list' ? 'list' : 'cards';
    p3 = undefined;
  }
  return { param1, param2, param3: p3, limit, layout };
}

export function extractShortcodes(content: string): ShortcodeParams[] {
  const shortcodes: ShortcodeParams[] = [];
  let match;

  while ((match = shortcodeRegex.exec(content)) !== null) {
    const [, param1, param2, param3, limitStr, layoutStr] = match;
    shortcodes.push(normalizeParams(param1, param2, param3, limitStr, layoutStr));
  }

  return shortcodes;
}

/**
 * Parse un shortcode issu d'un `String.split()` avec groupes de capture
 * (motif : texte + 5 groupes → modulo 6). Retourne null si ce n'est pas
 * un segment de shortcode valide.
 */
export function parseSplitShortcode(
  parts: string[],
  i: number,
): (ShortcodeParams & { limit: number }) | null {
  const param1 = (parts[i] || '').trim().toLowerCase();
  const param2 = (parts[i + 1] || '').trim().toLowerCase() || 'rating';
  const param3raw = (parts[i + 2] || '').trim().toLowerCase();
  const limitStr = parts[i + 3];
  const layoutStr = parts[i + 4];
  if (!param1) return null;
  const normalized = normalizeParams(param1, param2, param3raw || undefined, limitStr || undefined, layoutStr || undefined);
  if (normalized.limit == null || normalized.limit < 1) return null;
  return { ...normalized, limit: normalized.limit };
}

function shortcodeKey(params: ShortcodeParams): string {
  // Le layout n'influe pas sur les données : même clé = même fetch,
  // partagé entre les formats liste et cartes (zéro requête en plus).
  const parts = [params.param1, params.param2];
  if (params.param3) parts.push(params.param3);
  if (params.limit) parts.push(String(params.limit));
  return parts.join(':');
}

export async function fetchCottagesForShortcodes(
  shortcodes: ShortcodeParams[]
): Promise<Map<string, any[]>> {
  const results = new Map<string, any[]>();
  const uniqueShortcodes = new Map<string, ShortcodeParams>();
  
  // Deduplicate shortcodes
  for (const sc of shortcodes) {
    const key = shortcodeKey(sc);
    if (!uniqueShortcodes.has(key)) {
      uniqueShortcodes.set(key, sc);
    }
  }
  
  // Fetch cottages for each unique shortcode
  for (const [key, sc] of uniqueShortcodes.entries()) {
    try {
      const isProvince = ['ontario', 'quebec', 'alberta', 'british-columbia', 'nova-scotia', 'new-brunswick', 'manitoba', 'saskatchewan', 'pei', 'newfoundland'].includes(sc.param1);
      const cottages = await getCottages({
        province: isProvince ? sc.param1 : null,
        slug: isProvince ? null : sc.param1,
        sort: sc.param2,
        limit: sc.limit,
        featuredOnly: true,
        categories: sc.param2 && !['rating', 'price', 'newest', 'featured'].includes(sc.param2) ? [sc.param2] : [],
      });
      results.set(key, cottages);
    } catch (e) {
      console.error(`Failed to fetch cottages for shortcode ${key}:`, e);
      results.set(key, []);
    }
  }
  
  return results;
}

export function getCottagesForShortcode(
  cottagesMap: Map<string, any[]>,
  params: ShortcodeParams
): any[] {
  const key = shortcodeKey(params);
  return cottagesMap.get(key) || [];
}