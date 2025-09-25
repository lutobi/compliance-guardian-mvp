'use client';

// NEW: Multi-tenant authentication system
import { MultiTenantAuthProvider } from '@/lib/auth/MultiTenantContext';
import { WorkspaceContextProvider } from '@/lib/hooks/WorkspaceContext';
import { WorkspaceContextAdapter } from '@/lib/workspace/context-adapter';
import { AuthContextAdapter } from '@/lib/auth/context-adapter';

// Legacy providers (keeping for gradual migration)
// import { AuthProvider } from '@/lib/auth/context';
// import { CustomerProvider } from '@/lib/workspace/customer-context';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ToastProvider from '@/components/providers/ToastProvider';

// Create a client for React Query with optimized settings for multi-tenant
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MultiTenantAuthProvider>
        <AuthContextAdapter>
          <WorkspaceContextProvider>
            {/* Bridge between new multi-tenant system and legacy system */}
            <WorkspaceContextAdapter>
              <ToastProvider>
                {children}
              </ToastProvider>
            </WorkspaceContextAdapter>
          </WorkspaceContextProvider>
        </AuthContextAdapter>
      </MultiTenantAuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
