import { authkit } from '@workos-inc/authkit-nextjs';
import { NextResponse, type NextRequest } from 'next/server';
import { isDevelopment } from './lib/utils/environmentUtils';
import { unauthorized } from 'next/navigation';

const REDIRECT_PATHNAME = '/api/auth/callback';
const REDIRECT_ORIGIN =
  process.env.VERCEL_ENV === 'production'
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_ENV === 'preview'
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
const REDIRECT_URI = new URL(REDIRECT_PATHNAME, REDIRECT_ORIGIN);

// export default authkitMiddleware({ redirectUri: REDIRECT_URI.href });

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Get session state, headers, and authorization URL from AuthKit.
  // The `authkit` function handles cookie management, session validation, and refresh.
  const { session, headers, authorizationUrl } = await authkit(request, {
    debug: isDevelopment,
    redirectUri: REDIRECT_URI.href,
  });

  // const isGuest = guestRegex.test(session?.user?.email ?? '');

  if (!session?.user) {
    if (pathname.startsWith('/iframe')) {
      return NextResponse.next({ headers });
    } else if (authorizationUrl) {
      return NextResponse.redirect(authorizationUrl);
    } else {
      return unauthorized();
    }
  } else {
    // User IS logged in via AuthKit (session.user exists).
    // If a logged-in user tries to access AuthKit's login initiation page, redirect them away.
    if (pathname === '/auth/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    '/',
    '/chat/:id*',
    '/api/:path*',
    '/iframe',
    '/((?!_next/static|images|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
