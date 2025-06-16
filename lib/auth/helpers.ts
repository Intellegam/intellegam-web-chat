import { getUserByWorkOSId, ensureUserExists } from '@/lib/db/queries';
import { cache } from 'react';
import type { User } from '@/app/(auth)/auth';

// Get database user from WorkOS user object with caching
// This uses React's cache for memoization within a single request
export const getDbUser = cache(async (workosUser: User) => {
  try {
    // Get from database
    const dbUser = await getUserByWorkOSId(workosUser.id);

    // If for some reason we don't have a DB user, synchronize now
    // This might happen if webhooks failed
    if (!dbUser) {
      const syncedUser = await ensureUserExists({
        workosId: workosUser.id,
        email: workosUser.email,
      });

      // ensureUserExists should return the user, but double-check
      if (!syncedUser) {
        console.error(`Failed to sync user ${workosUser.id} to database`);
        return null;
      }

      return syncedUser;
    }

    return dbUser;
  } catch (error) {
    console.error(`Error getting database user for WorkOS ID ${workosUser.id}:`, error);
    return null;
  }
});

// Get just the database user ID - convenience function
export const getDbUserId = cache(async (workosUser: User): Promise<string | null> => {
  const dbUser = await getDbUser(workosUser);
  return dbUser?.id || null;
});

// Check if WorkOS user exists in database
export const isUserSynced = cache(async (workosUser: User): Promise<boolean> => {
  const dbUser = await getDbUser(workosUser);
  return !!dbUser;
});