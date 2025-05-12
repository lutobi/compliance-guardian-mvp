'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';

interface RoleGuardProps {
  requiredRole: 'system' | 'customer';
  children: React.ReactNode;
}

export default function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const { user, loading, isSystemUser, isCustomerUser } = useAuth();

  useEffect(() => {
    // Only do this check client-side and once loading is complete
    if (typeof window !== 'undefined' && !loading && user) {
      const hasCorrectRole = 
        (requiredRole === 'system' && isSystemUser) || 
        (requiredRole === 'customer' && isCustomerUser);

      if (!hasCorrectRole) {
        // If they don't have the required role, redirect to the auth redirect API
        // which will send them to the appropriate dashboard
        window.location.href = '/api/auth/redirect';
      }
    }
  }, [user, loading, isSystemUser, isCustomerUser, requiredRole]);

  // If still loading or no user, show loading state
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check role
  const hasCorrectRole = 
    (requiredRole === 'system' && isSystemUser) || 
    (requiredRole === 'customer' && isCustomerUser);

  // If they don't have the required role, show nothing (the redirect will happen)
  if (!hasCorrectRole) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Otherwise, render the children
  return <>{children}</>;
}