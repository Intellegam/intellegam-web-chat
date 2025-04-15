import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      //TODO: only the iframe route is allowed for now -Meris
      const isLoggedIn = !!auth?.user;
      const isOnIframe = nextUrl.pathname.startsWith('/iframe');
      const isOnChat = nextUrl.pathname.startsWith('/');
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isOnIframe) {
        return true;
      }

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      if (isOnRegister || isOnLogin) {
        return Response.redirect(new URL('/iframe', nextUrl as unknown as URL));
        // return true; // Always allow access to register and login pages
      }

      if (isOnChat) {
        return Response.redirect(new URL('/iframe', nextUrl as unknown as URL));
        // if (isLoggedIn) return true;
        // return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
