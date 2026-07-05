import { cache } from 'react'
import { db } from '@/lib/db'
import { siteSettings } from '@/db/schema'
import { defaultSettings } from '@/lib/settings-defaults'

export const getAllSettings = cache(async () => {
  try {
    const rows = await db.select().from(siteSettings)
    const map: Record<string, any> = { ...defaultSettings }
    for (const row of rows) {
      map[row.section] = row.data
    }
    return map
  } catch (e) {
    console.error('Failed to fetch settings:', e)
    return { ...defaultSettings }
  }
})