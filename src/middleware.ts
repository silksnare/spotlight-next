import { NextResponse, type NextRequest } from 'next/server';

import { hasAnyRole, requiredRolesForPath } from '@/lib/auth/access';
import { SESSION_COOKIE, readSessionToken } from '@/lib/auth/session';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/unauthorized',
  '/api/auth/saml/metadata',
  '/api/auth/saml/acs',
  '/api/auth/saml/callback',
  '/api/judge/round-1/score',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDevBypass =
    process.env.AUTH_MODE === 'dev' &&
    process.env.AUTH_DEV_BYPASS === 'true';

  if (isDevBypass) {
    const response = NextResponse.next();
    response.headers.set('x-spotlight-middleware', 'dev-bypass');
    return response;
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/upload')
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.headers.set('x-spotlight-middleware', 'no-session-cookie');
    return response;
  }

  const session = await readSessionToken(sessionCookie);
  if (!session) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.headers.set('x-spotlight-middleware', 'invalid-session');
    return response;
  }

  const requiredRoles = requiredRolesForPath(pathname);
  const allowed = hasAnyRole([session.user.role], requiredRoles);

  if (!allowed) {
    const response = NextResponse.redirect(new URL('/unauthorized', request.url));
    response.headers.set('x-spotlight-middleware', `blocked:${session.user.role}->${pathname}`);
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('x-spotlight-middleware', `allowed:${session.user.role}->${pathname}`);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};