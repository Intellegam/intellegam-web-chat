import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

// This route will redirect the user to the AuthKit sign-in page.
export async function GET() {
  // Generates the WorkOS AuthKit sign-in URL.
  const signInUrl = await getSignInUrl();

  redirect(signInUrl);
}
