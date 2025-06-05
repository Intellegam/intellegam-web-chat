import { signOut } from '@workos-inc/authkit-nextjs';
import type { NextRequest } from 'next/server';

// This route will redirect the user to the AuthKit sign-in page.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirectUrl') || '/';

  await signOut({ returnTo: redirectUrl });
}
