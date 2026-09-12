import { Redis } from '@upstash/redis'

const PROJECT_PREFIX = 'chaletexpress'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const prefixedKey = `chaletexpress:${key}`
  const cached = await redis.get(prefixedKey)
  if (cached) return cached as T

  const fresh = await fetcher()
  await redis.setex(prefixedKey, ttlSeconds, JSON.stringify(fresh))
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