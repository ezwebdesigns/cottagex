/**
 * Empêche le base64 d'entrer dans les champs CMS : une image doit passer par
 * la médiathèque (Vercel Blob), jamais par un data: stocké en DB/Redis/HTML.
 */
const DATA_URL_RE = /data:image\/[a-zA-Z0-9.+-]+;base64,/i

export function findBase64Fields(value: unknown, path = 'data'): string[] {
  if (typeof value === 'string') return DATA_URL_RE.test(value) ? [path] : []
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => findBase64Fields(v, `${path}[${i}]`))
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      findBase64Fields(v, `${path}.${k}`)
    )
  }
  return []
}

export function base64Error(fields: string[]) {
  return {
    error: 'Base64 images are not allowed. Upload the image to the Media Library and use its URL.',
    fields: fields.slice(0, 10),
  }
}
