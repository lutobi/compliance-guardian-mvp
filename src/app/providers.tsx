'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth/context';
import { CustomerProvider } from '@/lib/workspace/customer-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client for React Query
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CustomerProvider>
          <Toaster />
          {children}
        </CustomerProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
