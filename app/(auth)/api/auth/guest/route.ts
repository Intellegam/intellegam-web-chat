import { generateHashedPassword } from '@/lib/db/utils';
import { generateUUID } from '@/lib/utils';
import { getWorkOS, saveSession } from '@workos-inc/authkit-nextjs';
import { type NextRequest, NextResponse } from 'next/server';

// This route generates and registers a onetime user with a fake email and password
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirectUrl') || '/iframe';
  const workos = getWorkOS();

  const email = `guest-${generateUUID()}@guest.com`;
  const password = generateHashedPassword(generateUUID());

  await workos.userManagement.createUser({
    email: email,
    password: password,
    emailVerified: true,
  });
  //TODO: add guest user to an org to easily query that org and delete the users every month

  const authResponse = await workos.userManagement.authenticateWithPassword({
    email: email,
    password: password,
    clientId: process.env.WORKOS_CLIENT_ID,
  });

  await saveSession(authResponse, request);

  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
