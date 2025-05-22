// app/api/iframe-guest-auth/route.ts
import { signIn } from '@/app/(auth)/auth';
import { isDevelopmentEnvironment } from '@/lib/constants';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Check if user is already authenticated
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  // If already authenticated, return the token
  if (token) {
    return NextResponse.json(
      {
        success: true,
        isAuthenticated: true,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    );
  }

  // If not authenticated, sign in as guest
  try {
    // Use your existing guest provider but with redirect: false
    const result = (await signIn('guest', { redirect: false })) as any;

    if (result?.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        },
      );
    }

    // Guest login successful - return success
    return NextResponse.json(
      { success: true, isAuthenticated: true },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    );
  } catch (error) {
    console.error('Iframe guest auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    );
  }
}
