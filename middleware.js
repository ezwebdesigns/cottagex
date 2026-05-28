import { NextResponse } from 'next/server';

const locales = ['en', 'fr'];
const defaultLocale = 'en';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return;
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const acceptLanguage = request.headers.get('accept-language') || '';
    const preferredLocale = locales.find(locale => acceptLanguage.startsWith(locale)) || defaultLocale;
    request.nextUrl.pathname = `/${preferredLocale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const locale = pathname.split('/')[1];
  const adminPath = `/${locale}/admin`;

  if (pathname === adminPath || pathname.startsWith(adminPath + '/')) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return new NextResponse('Authentication required', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
        });
      }
      const decoded = atob(authHeader.slice(6));
      const [, password] = decoded.split(':');
      if (password !== adminPassword) {
        return new NextResponse('Invalid credentials', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
        });
      }
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  response.headers.set('x-pathname', pathname);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
