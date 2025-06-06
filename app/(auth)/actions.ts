'use server';

import { z } from 'zod';

import { createUser, getUser } from '@/lib/db/queries';
import { signOut } from '@workos-inc/authkit-nextjs';

export async function signOutAction(_: FormData) {
  await signOut();
}

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

// NOTE: This action currently returns success without authentication
// This is intentional as we're using WorkOS hosted auth via /api/auth/login
// The login/register pages are not actively used but kept for future custom flows
// Redirects to WorkOS hosted login
// Keep this for now in case we want to add custom pre-login logic later
export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // await signIn('credentials', {
    //   email: validatedData.email,
    //   password: validatedData.password,
    //   redirect: false,
    // });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

// NOTE: This action currently creates users without proper authentication
// This is intentional as we're using WorkOS hosted auth
// The register flow is handled by WorkOS at /api/auth/login
//TODO: if we need a custom login box this should be changed to the workos flow
export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    }
    await createUser(validatedData.email, validatedData.password);
    // await signIn('credentials', {
    //   email: validatedData.email,
    //   password: validatedData.password,
    //   redirect: false,
    // });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};
