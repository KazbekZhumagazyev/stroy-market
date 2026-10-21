import { type NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE = 'ygm_admin';

/** Без входа админка недоступна: всё, кроме /admin/login, уводим на страницу входа. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = request.cookies.has(ADMIN_COOKIE);
  if (pathname === '/admin/login') {
    return authed ? NextResponse.redirect(new URL('/admin', request.url)) : NextResponse.next();
  }
  if (!authed) {
    const url = new URL('/admin/login', request.url);
    if (pathname !== '/admin') url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
