import { signOut } from '@workos-inc/authkit-nextjs';
import Form from 'next/form';

export const SignOutForm = () => {
  return (
    <Form
      className="w-full"
      action={async () => {
        'use server';

        await signOut({ returnTo: '/' });
      }}
    >
      <button
        type="submit"
        className="w-full text-left px-1 py-0.5 text-red-500"
      >
        Sign out
      </button>
    </Form>
  );
};
