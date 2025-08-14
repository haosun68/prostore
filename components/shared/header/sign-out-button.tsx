'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        // Use signOut with explicit configuration for production
        await signOut({
          callbackUrl: window.location.origin,
          redirect: false, // Handle redirect manually for better control
        });
        
        // Force navigation and refresh
        router.push('/');
        router.refresh();
        
        // Force page reload to clear all state
        window.location.href = '/';
      } catch (error) {
        console.error('Sign out error:', error);
        // Fallback: force clear by redirecting to home
        window.location.href = '/';
      }
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
