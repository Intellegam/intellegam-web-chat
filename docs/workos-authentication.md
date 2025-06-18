# WorkOS Authentication Integration

This document describes the migration from NextAuth to WorkOS AuthKit and how authentication works in the application.

## Overview

The application has been migrated from NextAuth.js to WorkOS AuthKit for authentication. WorkOS AuthKit provides a hosted authentication solution with built-in security features and enterprise-grade authentication flows.

## Key Changes

### Authentication Provider
- **Before**: NextAuth.js with custom credentials provider
- **After**: WorkOS AuthKit with hosted authentication

### Environment Variables
Required WorkOS environment variables:
```env
WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_API_KEY=your_workos_api_key
WORKOS_COOKIE_PASSWORD=your_32_character_cookie_password
```

### Authentication Flow

1. **Unauthenticated Users**: Redirected to `/start` landing page
2. **Login/Register**: Redirected to WorkOS hosted authentication at `/api/auth/login`
3. **Callback**: WorkOS handles authentication callback at `/api/auth/callback`
4. **Session Management**: WorkOS manages session cookies and user state

### Code Changes

#### Middleware (`middleware.ts`)
- Uses `authkit()` function from WorkOS to check authentication
- Redirects `/login` and `/register` to WorkOS hosted auth
- Protects routes by redirecting unauthenticated users to `/start`

#### API Routes
All API routes now use `withAuth()` instead of `auth()`:
```typescript
// Before (NextAuth)
import { auth } from '@/app/(auth)/auth';
const session = await auth();

// After (WorkOS)
import { withAuth } from '@workos-inc/authkit-nextjs';
const session = await withAuth();
```

#### User Types
- **Before**: Custom `User` type with `id`, `email`, `type` fields
- **After**: WorkOS `UserInfo['user']` type with standardized fields

## Authentication Routes

### Public Routes
- `/start` - Landing page for unauthenticated users
- `/api/auth/*` - WorkOS authentication endpoints
- `/iframe` - Iframe route (bypasses auth)

### Protected Routes
All other routes require authentication and redirect to `/start` if not authenticated.

### Authentication Endpoints
- `/api/auth/login` - Redirects to WorkOS hosted login
- `/api/auth/callback` - WorkOS authentication callback handler
- `/api/auth/guest` - Disabled (returns empty response)

## Testing Considerations

### Updated Tests
- Unauthenticated users now redirect to `/start` instead of login page
- Login/register pages redirect to WorkOS hosted auth (external URLs)
- Session-based tests need to account for WorkOS authentication flow

## Security Benefits

1. **Hosted Authentication**: Reduces attack surface by using WorkOS hosted pages
2. **Enterprise Features**: Built-in support for SSO, MFA, and directory sync
3. **Security Best Practices**: WorkOS handles security updates and compliance
4. **Session Management**: Secure cookie handling and session lifecycle

## Future Plans

Currently using WorkOS hosted authentication pages for quick implementation. Planning to implement custom login/register pages later while keeping WorkOS as the authentication backend.

When implementing custom pages:
1. Update WorkOS configuration to allow custom UI
2. Re-enable and update the currently skipped authentication tests
3. Update the auth setup to work with custom forms instead of hosted flow

## Migration Notes

### Removed Dependencies
- NextAuth.js related code (kept in package.json for fork compatibility)
- Custom credential providers
- Session and JWT configuration

### Backwards Compatibility
- User database schema remains unchanged
- User creation/lookup logic preserved for WorkOS callback integration
- Existing user data migrates seamlessly

### Configuration
Ensure WorkOS is properly configured in your environment:
1. Set up WorkOS application in WorkOS dashboard
2. Configure callback URL: `${YOUR_DOMAIN}/api/auth/callback`
3. Set environment variables
4. Test authentication flow in development

## Authentication Patterns

### Consistent Usage Guidelines

#### API Routes
Always use `withAuth()` for API route authentication:
```typescript
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function POST(request: Request) {
  const session = await withAuth();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Your API logic here
}
```

#### User Type Handling
For this branch, all WorkOS authenticated users are treated as 'regular' type:
```typescript
import type { UserType } from '@/app/(auth)/auth';

// In API routes or server components
const userType: UserType = 'regular'; // All WorkOS users are regular
```

### Anti-Patterns to Avoid

❌ **Don't wrap `withAuth({ ensureSignedIn: true })` in try-catch**
```typescript
// This will cause NEXT_REDIRECT errors
try {
  const { user } = await withAuth({ ensureSignedIn: true });
} catch (error) {
  // Error handling here
}
```

❌ **Don't use WorkOS server functions in client components**
```typescript
// This will cause import errors
'use client';
import { withAuth } from '@workos-inc/authkit-nextjs'; // Wrong!
```
