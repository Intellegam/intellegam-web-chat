import { ensureUserExists } from '@/lib/db/queries';
import { handleAuth } from '@workos-inc/authkit-nextjs';

// The '/auth/callback' route is required by AuthKit to handle the authentication callback.
// It automatically exchanges the authorization code for a session and redirects.
export const GET = handleAuth({
  onSuccess: async ({ user }) => {
    // This is the backup sync - runs only once after successful login
    try {
      await ensureUserExists({
        workosId: user.id,
        email: user.email,
      });
      console.log(`User synced successfully: ${user.email}`);
    } catch (error) {
      // Don't fail the auth flow if sync fails
      console.error('Post-auth user sync failed:', error);
    }
  },
});
