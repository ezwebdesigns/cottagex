// Verify Clear Cache backend path (no secrets printed)
import { Redis } from '@upstash/redis'
import { invalidateCache, clearProjectCache } from '../src/lib/cache.ts'

const hasUrl = !!process.env.UPSTASH_REDIS_REST_URL
const hasToken = !!process.env.UPSTASH_REDIS_REST_TOKEN
console.log('UPSTASH env present:', { url: hasUrl, token: hasToken })

if (!hasUrl || !hasToken) {
  console.log('RESULT: MISSING_ENV — Clear Cache cannot work in this environment')
  process.exit(0)
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const TEST_KEY = 'chaletexpress:__clear_cache_probe__'

try {
  const before = await redis.keys('chaletexpress:*')
  console.log('Keys before:', before.length)

  await redis.set(TEST_KEY, 'probe')
  const existsAfterSet = await redis.exists(TEST_KEY)
  console.log('Probe key written:', existsAfterSet === 1)

  // Test the exact function used by /api/admin/cache/clear
  await clearProjectCache()

  const existsAfterClear = await redis.exists(TEST_KEY)
  const after = await redis.keys('chaletexpress:*')
  console.log('Probe key after clear:', existsAfterClear)
  console.log('Keys after:', after.length)
  console.log('RESULT:', existsAfterClear === 0 ? 'OK — clearProjectCache removed all chaletexpress keys' : 'FAIL — probe still present')
} catch (e) {
  console.log('RESULT: ERROR —', e?.message || String(e))
}
