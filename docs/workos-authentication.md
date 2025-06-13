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

#### Sign Out
```typescript
// Before (NextAuth)
import { signOut } from '@/app/(auth)/auth';
await signOut();

// After (WorkOS)
import { signOut } from '@workos-inc/authkit-nextjs';
await signOut();
```

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

## User Interface Changes

### User Navigation (`components/sidebar-user-nav.tsx`)
- Uses `useAuth()` hook from WorkOS for loading states
- Calls `signOutAction` for logout functionality
- Shows loading spinner during auth state changes

### Landing Page (`app/start/page.tsx`)
- New landing page for unauthenticated users
- Provides links to sign in and create account
- Both link to WorkOS hosted authentication

## Testing Considerations

### Updated Tests
- Unauthenticated users now redirect to `/start` instead of login page
- Login/register pages redirect to WorkOS hosted auth (external URLs)
- Session-based tests need to account for WorkOS authentication flow

### Skipped Tests
Tests that relied on local authentication forms are skipped since authentication now happens on WorkOS hosted pages:
- Local registration form testing
- Local login form testing
- Custom password validation

### Integration Testing
Consider adding tests for:
- Proper redirects to WorkOS
- Callback handling
- Session persistence
- Sign out functionality

## Security Benefits

1. **Hosted Authentication**: Reduces attack surface by using WorkOS hosted pages
2. **Enterprise Features**: Built-in support for SSO, MFA, and directory sync
3. **Security Best Practices**: WorkOS handles security updates and compliance
4. **Session Management**: Secure cookie handling and session lifecycle

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

#### Page Components (Server Components)
Use `withAuth({ ensureSignedIn: false })` for pages that may have both authenticated and unauthenticated states:
```typescript
import { withAuth } from '@workos-inc/authkit-nextjs';

export default async function Page() {
  const session = await withAuth({ ensureSignedIn: false });
  
  if (!session?.user) {
    // Handle unauthenticated state
    return <UnauthenticatedView />;
  }
  
  // Authenticated view
  return <AuthenticatedView user={session.user} />;
}
```

#### Client Components
Use the `useAuth()` hook for client-side authentication state:
```typescript
'use client';
import { useAuth } from '@workos-inc/authkit-nextjs/components';

export function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;
  
  return <UserContent user={user} />;
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

❌ **Don't mix authentication patterns**
```typescript
// Don't use both NextAuth and WorkOS imports
import { auth } from '@/app/(auth)/auth'; // Old NextAuth
import { withAuth } from '@workos-inc/authkit-nextjs'; // New WorkOS
```

## Troubleshooting

### Common Issues
1. **Redirect Loops**: Check WORKOS_CLIENT_ID and callback URL configuration
2. **Session Not Persisting**: Verify WORKOS_COOKIE_PASSWORD is 32 characters
3. **API Authentication Failing**: Ensure all API routes use `withAuth()` instead of `auth()`
4. **Component Import Errors**: Verify server vs client component usage
5. **NEXT_REDIRECT Errors**: Don't wrap `withAuth({ ensureSignedIn: true })` in try-catch

### Debug Mode
Enable debug mode in development by setting `debug: true` in middleware authkit configuration.