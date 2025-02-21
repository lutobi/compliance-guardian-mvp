'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Error</h2>
          <p className="mt-2 text-gray-600">
            {error.message || 'An error occurred while loading the dashboard.'}
          </p>
          {error.digest && (
            <p className="mt-2 text-sm text-gray-500">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        
        <div className="space-x-4">
          <Button onClick={reset}>
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh page
          </Button>
        </div>
      </div>
    </div>
  );
}
