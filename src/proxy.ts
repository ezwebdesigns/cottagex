import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/maintenance') ||
    pathname === '/favicon.ico'

  if (isStatic) return NextResponse.next()

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
