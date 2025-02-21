'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth-context';
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <KindeProvider>
      <AuthProvider>
        <Toaster />
        {children}
      </AuthProvider>
    </KindeProvider>
  );
}
