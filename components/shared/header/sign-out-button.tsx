'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut({
        callbackUrl: '/',
        redirect: true,
      });
    });
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isPending}
      className='w-full py-4 px-2 h-4 justify-start'
      variant='ghost'
    >
      {isPending ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
