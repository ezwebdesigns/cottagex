import { db } from '@/lib/db';
import { libraryImages } from '@/db/schema';
import { eq } from 'drizzle-orm';

const cache = new Map<number, string>();

export async function resolveLibRefs<T>(obj: T): Promise<T> {
  if (typeof obj === 'string') {
    const match = obj.match(/^lib:(\d+)$/);
    if (match) {
      const id = Number(match[1]);
      if (cache.has(id)) return cache.get(id) as T;
      const [image] = await db.select({ url: libraryImages.url }).from(libraryImages).where(eq(libraryImages.id, id));
      if (image) {
        cache.set(id, image.url);
        return image.url as T;
      }
      return '' as T;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => resolveLibRefs(item))) as Promise<T>;
  }
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = await resolveLibRefs(val);
    }
    return result as T;
  }
  return obj;
}
