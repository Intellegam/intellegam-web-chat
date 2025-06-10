import type { UserInfo } from '@workos-inc/authkit-nextjs';

/**
 * User types supported by the application
 * - 'regular': Authenticated users via WorkOS
 * - 'guest': Guest users
 */
export type UserType = 'guest' | 'regular';

/**
 * User type definition based on WorkOS AuthKit UserInfo
 */
export type User = UserInfo['user'];
