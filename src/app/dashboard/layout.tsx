'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, isSystemUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (!isSystemUser) {
        router.replace('/customer/dashboard');
      }
    }
  }, [user, loading]);

  if (loading || !user || !isSystemUser) {
    return null;
  }

  return <>{children}</>;
}
