import { redis } from '@/lib/redis'

const PROJECT_PREFIX = 'chaletexpress'

function prefixKey(key: string): string {
  return `${PROJECT_PREFIX}:${key}`
}

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const prefixedKey = prefixKey(key)
  const cached = await redis.get(prefixedKey)
  if (cached) {
    return JSON.parse(cached as string) as T
  }

  const fresh = await fetcher()
  await redis.setex(prefixedKey, ttlSeconds, JSON.stringify(fresh))
  return fresh
}

export async function invalidatePrefix(prefix: string): Promise<number> {
  const keys = await redis.keys(prefixKey(`${prefix}*`))
  if (keys.length > 0) {
    return await redis.del(...keys)
  }
  return 0
}

export async function clearProjectCache(): Promise<number> {
  const keys = await redis.keys(prefixKey('*'))
  if (keys.length > 0) {
    return await redis.del(...keys)
  }
  return 0
}

export async function invalidateSettings(): Promise<number> {
  return await invalidatePrefix('settings:')
}

export async function invalidateArticles(): Promise<number> {
  return await invalidatePrefix('articles:')
}

export async function invalidatePages(): Promise<number> {
  return await invalidatePrefix('pages:')
}

export async function invalidateCottages(): Promise<number> {
  return await invalidatePrefix('cottages:')
}