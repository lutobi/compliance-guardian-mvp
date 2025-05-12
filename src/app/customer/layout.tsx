'use client';

import { AuthProvider } from '@/lib/auth/context';
import { CustomerProvider } from '@/lib/workspace/customer-context';
import { redirect } from 'next/navigation';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CustomerProvider>
        {children}
      </CustomerProvider>
    </AuthProvider>
  );
}
