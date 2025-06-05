import { authkit } from '@workos-inc/authkit-nextjs';
import { NextResponse, type NextRequest } from 'next/server';
import { WORKOS_REDIRECT_URI } from './lib/constants';
import { isDevelopment } from './lib/utils/environmentUtils';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Health check for Playwright tests
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  // Get session from AuthKit - lightweight check only
  const { session, headers } = await authkit(request, {
    debug: isDevelopment,
    redirectUri: WORKOS_REDIRECT_URI.href,
  });

  // Redirect login and register pages to WorkOS hosted auth
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }
  const response = NextResponse.next({ headers });

  // Public routes that don't require authentication
  const publicRoutes = ['/start', '/api/auth', '/iframe'];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}`),
  );

  if (isPublicRoute) {
    return NextResponse.next({ headers });
  }

  // Redirect unauthenticated users to landing page
  if (!session?.user) {
    return NextResponse.redirect(new URL('/start', request.url));
  }

  // Redirect authenticated users away from public pages
  if (pathname === '/start') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Continue with the request, passing along AuthKit headers
  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    '/',
    '/start',
    '/chat/:id*',
    '/api/:path*',
    '/iframe',
    '/login',
    '/register',
    '/((?!_next/static|images|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
