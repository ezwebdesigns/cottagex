import { Redis } from '@upstash/redis'

const PROJECT_PREFIX = 'chaletexpress'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

function usageKey(): string {
  const d = new Date();
  return `usage:redis:ops:${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function trackOp(): void {
  // Best-effort monthly counter for the Upstash free-tier quota.
  // Fire-and-forget on purpose: usage telemetry must never slow down
  // (nor break) page renders. Slight undercount on serverless freeze
  // is acceptable for a gauge.
  redis.incr(usageKey()).catch(() => {});
  redis.expire(usageKey(), 90 * 24 * 3600).catch(() => {});
}

export async function getUsageThisMonth(): Promise<number> {
  try {
    const v = await redis.get<number>(usageKey());
    return typeof v === 'number' ? v : 0;
  } catch {
    return 0;
  }
}

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
  opts?: { emptyTtlSeconds?: number }
): Promise<T> {
  const prefixedKey = `chaletexpress:${key}`
  trackOp();
  // Fail-open: a Redis outage must never break page renders — fall
  // through to the DB fetcher and skip caching for this hit.
  try {
    const cached = await redis.get(prefixedKey)
    if (cached != null) return cached as T
  } catch {}
  const fresh = await fetcher()
  const isEmpty =
    fresh == null ||
    (Array.isArray(fresh) && fresh.length === 0) ||
    (typeof fresh === 'object' && Object.keys(fresh as object).length === 0)
  // Empty results get a short TTL: a miss storm on unknown slugs would
  // otherwise pin useless keys for the full TTL.
  const ttl = isEmpty && opts?.emptyTtlSeconds ? opts.emptyTtlSeconds : ttlSeconds
  try {
    await redis.setex(prefixedKey, ttl, JSON.stringify(fresh))
  } catch {}
  return fresh
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(`chaletexpress:${pattern}`)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

export async function invalidateAll(): Promise<void> {
  const keys = await redis.keys('chaletexpress:*')
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

// Specific cache invalidation functions for backward compatibility
export async function clearProjectCache(): Promise<void> {
  await invalidateAll()
}

export async function invalidateSettings(): Promise<void> {
  await invalidateCache('settings:*')
}

export async function invalidateArticles(): Promise<void> {
  await invalidateCache('articles:*')
}

export async function invalidatePages(): Promise<void> {
  await invalidateCache('pages:*')
}

export async function invalidateCottages(): Promise<void> {
  await invalidateCache('cottages:*')
}