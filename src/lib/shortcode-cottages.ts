import { getCottages } from './cottages';

const shortcodeRegex = /\[([a-z0-9-]+),\s*([a-z0-9-]+)(?:,\s*([a-z0-9-]+))?(?:,\s*(\d+))?\]/g;

export interface ShortcodeParams {
  param1: string;
  param2: string;
  param3?: string;
  limit?: number;
}

export function extractShortcodes(content: string): ShortcodeParams[] {
  const shortcodes: ShortcodeParams[] = [];
  let match;

  while ((match = shortcodeRegex.exec(content)) !== null) {
    const [, param1, param2, param3, limitStr] = match;
    // Même règle que dans les templates : un 3e segment numérique
    // (ex. [ontario, rating, 6]) est le LIMIT, pas une catégorie.
    let p3: string | undefined = param3;
    let limit: number | undefined = limitStr ? parseInt(limitStr, 10) : undefined;
    if (limit === undefined && p3 && /^\d+$/.test(p3)) {
      limit = parseInt(p3, 10);
      p3 = undefined;
    }
    shortcodes.push({ param1, param2, param3: p3, limit });
  }

  return shortcodes;
}

function shortcodeKey(params: ShortcodeParams): string {
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