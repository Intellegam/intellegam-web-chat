import { handleAuth } from '@workos-inc/authkit-nextjs';

// The '/auth/callback' route is required by AuthKit to handle the authentication callback.
// It automatically exchanges the authorization code for a session and redirects.
export const GET = handleAuth();
