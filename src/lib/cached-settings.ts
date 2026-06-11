import { cache } from 'react'
import { db } from '@/lib/db'
import { siteSettings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { defaultSettings } from '@/lib/settings-defaults'

export const getSettings = cache(async (section: string) => {
  try {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.section, section))
    return (row?.data ?? defaultSettings[section]) as any
  } catch (e) {
    console.error(`Failed to fetch settings for ${section}:`, e)
    return defaultSettings[section]
  }
})
