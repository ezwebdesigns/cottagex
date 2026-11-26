/**
 * Client-side cache for the shared `general` settings section.
 * Header and AppSidebar both need it on every page; a module-level promise
 * dedupes the request so it is fetched once per locale per page load.
 */
const cache = new Map<string, Promise<Record<string, any>>>()

export function getGeneralSettings(locale: string): Promise<Record<string, any>> {
  const key = locale || 'en'
  const existing = cache.get(key)
  if (existing) return existing
  const pending = fetch(`/api/admin/settings?section=general&locale=${encodeURIComponent(key)}`)
    .then((r) => r.json())
    .catch(() => ({}))
  cache.set(key, pending)
  return pending
}
