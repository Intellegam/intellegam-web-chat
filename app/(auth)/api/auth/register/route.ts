import { getSignUpUrl } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

// This route will redirect the user to the AuthKit sign-up page.
export async function GET() {
  const signUpUrl = await getSignUpUrl();

  return redirect(signUpUrl);
}
