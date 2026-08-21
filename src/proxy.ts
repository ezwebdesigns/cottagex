import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'fr']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/maintenance') ||
    pathname === '/favicon.ico' ||
    pathname === '/ads.txt' ||
    pathname === '/logo.png'

  if (isStatic) return NextResponse.next()

  // Détection automatique de la langue : redirige / et les chemins sans
  // préfixe vers la locale préférée du visiteur (Accept-Language).
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )

  if (!pathnameHasLocale) {
    const acceptLanguage = request.headers.get('accept-language') || ''
    const preferredLocale = acceptLanguage.toLowerCase().startsWith('fr') ? 'fr' : 'en'
    const url = request.nextUrl.clone()
    url.pathname = `/${preferredLocale}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  // Poser les headers consommés par app/layout.tsx (lang HTML, hreflang,
  // canonical) — sans eux, <html lang> est "en" sur tout le site.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  requestHeaders.set('x-locale', pathname.startsWith('/fr') ? 'fr' : 'en')

  if (process.env.MAINTENANCE_MODE !== 'true') {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const isAdmin =
    pathname.includes('/admin/') ||
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/api/auth')

  if (isAdmin) return NextResponse.next({ request: { headers: requestHeaders } })

  return NextResponse.rewrite(new URL('/maintenance', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}