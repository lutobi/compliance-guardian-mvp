'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth/context';
import { CustomerProvider } from '@/lib/workspace/customer-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CustomerProvider>
        <Toaster />
        {children}
      </CustomerProvider>
    </AuthProvider>
  );
}
