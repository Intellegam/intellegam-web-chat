// components/IframeAutoAuth.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function IframeAutoAuth({
  children,
}: { children: React.ReactNode }) {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isIframe = window !== window.top;

    // Only auto-auth in iframe context and when not already authenticated
    if (isIframe && status === 'unauthenticated') {
      const performAuth = async () => {
        try {
          // Try to automatically sign in as guest
          const response = await fetch('/api/auth/iframe');
          const data = await response.json();
          console.info(data);

          if (!data.success) {
            console.error('Failed to authenticate iframe:', data.error);
            setError('Authentication failed');
          }
        } catch (error) {
          console.error('Error during iframe authentication:', error);
          setError('Authentication error');
        } finally {
          setIsLoading(false);
        }
      };

      console.info('here');

      performAuth();
    } else {
      // Not in iframe or already authenticated
      setIsLoading(false);
    }
  }, [status]);

  // Handle various states
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  // Render children when authenticated or not in iframe
  return <>{children}</>;
}
