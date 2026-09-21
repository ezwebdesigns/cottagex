import { db } from '@/lib/db';
import { libraryImages } from '@/db/schema';
import { inArray } from 'drizzle-orm';

const LIB_REF_RE = /^lib:(\d+)$/;

function collectIds(obj: unknown, out: Set<number>): void {
  if (typeof obj === 'string') {
    const match = obj.match(LIB_REF_RE);
    if (match) out.add(Number(match[1]));
    return;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) collectIds(item, out);
    return;
  }
  if (obj && typeof obj === 'object') {
    for (const val of Object.values(obj)) collectIds(val, out);
  }
}

function substitute<T>(obj: T, urls: Map<number, string>): T {
  if (typeof obj === 'string') {
    const match = obj.match(LIB_REF_RE);
    if (match) return (urls.get(Number(match[1])) ?? '') as T;
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => substitute(item, urls)) as T;
  }
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = substitute(val, urls);
    }
    return result as T;
  }
  return obj;
}

/**
 * Resolves every "lib:{id}" string in an object to its library_images URL.
 * Batch version: ONE `WHERE id = ANY(...)` query no matter how many refs
 * (previously one sequential SELECT per ref). Missing ids resolve to ''.
 */
export async function resolveLibRefs<T>(obj: T): Promise<T> {
  const ids = new Set<number>();
  collectIds(obj, ids);
  if (ids.size === 0) return obj;
  const rows = await db
    .select({ id: libraryImages.id, url: libraryImages.url })
    .from(libraryImages)
    .where(inArray(libraryImages.id, [...ids]));
  const urls = new Map(rows.map((r) => [r.id, r.url]));
  return substitute(obj, urls);
}
