'use server';

import { z } from 'zod';

import { getUser } from '@/lib/db/queries';
import { signOut } from '@workos-inc/authkit-nextjs';
import { WORKOS_LOGOUT_REDIRECT_URI } from '@/lib/constants';

export async function signOutAction(_: FormData) {
  await signOut({ returnTo: WORKOS_LOGOUT_REDIRECT_URI.href });
}

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

// Legacy action: Login is now handled by WorkOS hosted auth
// This action is maintained for component compatibility but doesn't perform authentication
// Actual login happens via middleware redirect to /api/auth/login -> WorkOS AuthKit
export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  // Throw error - this action should not be called during WorkOS hosted auth
  // Remove this error when transitioning to custom auth UI
  throw new Error(
    'Login action disabled during WorkOS hosted auth migration. Middleware should redirect /login to WorkOS.',
  );

  // biome-ignore lint/correctness/noUnreachable: <explanation>
  try {
    // Validate form data for UI feedback purposes only
    authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // No actual authentication occurs here - handled by WorkOS
    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    console.error('Login action error:', error);
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

// Legacy action: Registration is now handled by WorkOS hosted auth
// This action is maintained for component compatibility but creates security risk
// Actual registration should happen via WorkOS AuthKit only
// TODO: Remove user creation logic when fully migrated to WorkOS
export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  // Throw error - this action should not be called during WorkOS hosted auth
  // Remove this error when transitioning to custom auth UI
  throw new Error(
    'Register action disabled during WorkOS hosted auth migration. Middleware should redirect /register to WorkOS.',
  );

  // biome-ignore lint/correctness/noUnreachable: <explanation>
  try {
    // Validate form data for UI feedback purposes
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // Check if user already exists for UI feedback
    const [user] = await getUser(validatedData.email);
    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    }

    // SECURITY WARNING: This creates a user without proper WorkOS authentication
    // This should be removed once WorkOS webhook handles user creation
    //await createUser(validatedData.email, validatedData.password);

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    console.error('Register action error:', error);
    return { status: 'failed' };
  }
};
