// Reproduce the exact failure of /api/admin/cache/clear with missing Upstash env
import { clearProjectCache } from '../src/lib/cache.ts'

try {
  await clearProjectCache()
  console.log('RESULT: clearProjectCache succeeded')
} catch (e) {
  console.log('RESULT: clearProjectCache threw:', e?.message || String(e))
}
