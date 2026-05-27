import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from '@/i18n/routing';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return;
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const locale = pathname.split('/')[1];
    const response = NextResponse.next();
    response.headers.set('x-locale', locale);
    response.headers.set('x-pathname', pathname);
    return response;
  }

  const acceptLanguage = request.headers.get('accept-language') || '';
  const preferredLocale = locales.find(locale => acceptLanguage.startsWith(locale)) || defaultLocale;

  request.nextUrl.pathname = `/${preferredLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
