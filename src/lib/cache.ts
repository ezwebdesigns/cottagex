import { Redis } from '@upstash/redis';

// Préfixe du projet, unique sur la base partagée.
const PROJECT_PREFIX = 'chaletexpress';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getUsageThisMonth(): Promise<number> {
  const key = `usage:redis:ops:${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}`;
  try {
    const v = await redis.get<number>(key);
    return typeof v === 'number' ? v : 0;
  } catch {
    return 0;
  }
}

/**
 * Cache avec TTL, fail-open (Redis en panne ne casse jamais le rendu).
 * Le contenu N'EST PAS mis en cache ici : seul le métadonnées sont stockés.
 * Le corps est lu en base à chaque demande (lecture légère, pas de blob 4 Mo).
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
  opts?: { emptyTtlSeconds?: number }
): Promise<T> {
  const prefixedKey = `${PROJECT_PREFIX}:${key}`;
  try {
    const cached = await redis.get<T>(prefixedKey);
    if (cached != null) return cached;
  } catch {
    // Fail-open : une panne Redis ne doit pas casser le rendu.
  }
  const fresh = await fetcher();
  const isEmpty =
    fresh == null ||
    (Array.isArray(fresh) && fresh.length === 0) ||
    (typeof fresh === 'object' && Object.keys(fresh as object).length === 0);
  const ttl = isEmpty && opts?.emptyTtlSeconds ? opts.emptyTtlSeconds : ttlSeconds;
  try {
    await redis.setex(prefixedKey, ttl, JSON.stringify(fresh));
  } catch {
    // Fail-open : l'écriture ne doit pas casser la page.
  }
  return fresh;
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(`${PROJECT_PREFIX}:${pattern}`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export async function invalidateAll(): Promise<void> {
  const keys = await redis.keys(`${PROJECT_PREFIX}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// API d'invalidation existante — conservée pour compatibilité.
export async function clearProjectCache(): Promise<void> {
  await invalidateAll();
}

export async function invalidateSettings(): Promise<void> {
  await invalidateCache('settings:*');
}

export async function invalidateArticles(): Promise<void> {
  await invalidateCache('articles:*');
}

export async function invalidatePages(): Promise<void> {
  await invalidateCache('pages:*');
}

export async function invalidateCottages(): Promise<void> {
  await invalidateCache('cottages:*');
}