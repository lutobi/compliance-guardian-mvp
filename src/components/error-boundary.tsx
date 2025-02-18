'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md space-y-6 p-4 text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-gray-500">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="space-x-4">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh page
          </Button>
        </div>
      </div>
    </div>
  );
}
