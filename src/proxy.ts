import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'fr']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect /fr/apple-icon and /en/apple-icon to /apple-touch-icon.png
  // 308 = permanent: consolidates link equity on the canonical icon URL.
  if (pathname === '/fr/apple-icon' || pathname === '/en/apple-icon') {
    return NextResponse.redirect(new URL('/apple-touch-icon.png', request.url), 308)
  }

  const isStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/maintenance') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/android-chrome-') ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon-16x16.png' ||
    pathname === '/favicon-32x32.png' ||
    pathname === '/apple-touch-icon.png' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/ads.txt' ||
    pathname === '/logo.png' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    // Locale-prefixed static files
    pathname.match(/^\/(en|fr)\/(manifest\.webmanifest|apple-touch-icon\.png|favicon\.ico|favicon-16x16\.png|favicon-32x32\.png|android-chrome-192x192\.png|android-chrome-512x512\.png|images\/)/) ||
    pathname === '/fr/apple-touch-icon.png' ||
    pathname === '/en/apple-touch-icon.png' ||
    pathname === '/fr/favicon.ico' ||
    pathname === '/en/favicon.ico' ||
    pathname === '/fr/manifest.webmanifest' ||
    pathname === '/en/manifest.webmanifest';

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
    // 308 permanent (not default 307): consolidates link equity on /en|/fr
    // and stops crawlers from re-requesting the non-canonical path.
    return NextResponse.redirect(url, 308)
  }

  // Poser les headers consommés par app/layout.tsx (lang HTML, hreflang,
  // canonical) — sans eux, <html lang> est "en" sur tout le site.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  requestHeaders.set('x-locale', pathname.startsWith('/fr') ? 'fr' : 'en')

  if (process.env.MAINTENANCE_MODE !== 'true') {
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    const search = request.nextUrl.searchParams
    const isPreview = search.get('preview') === '1'
    const isSearch =
      pathname === '/en/search' || pathname === '/fr/search' ||
      pathname.startsWith('/en/search/') || pathname.startsWith('/fr/search/')
    if (pathname.includes('/admin') || isPreview) {
      // Never cache: admin pages + draft previews (a preview URL must
      // never be served from a shared cache).
      response.headers.set('Cache-Control', 'no-store, must-revalidate')
    } else if (request.method === 'GET' && !isSearch) {
      // Edge-cache public pages 5 min, serve stale 10 min while revalidating.
      // Search excluded: unbounded URL space (bots) for little SEO value.
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    }
    // Search pages keep the framework default (dynamic, uncached at edge).
    return response
  }

  const isAdmin =
    pathname.includes('/admin') ||
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/api/auth')

  if (isAdmin) return NextResponse.next({ request: { headers: requestHeaders } })

  return NextResponse.rewrite(new URL('/maintenance', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}