'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/lib/services/authService';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * Component to guard routes based on authentication and role
 * 
 * Usage:
 * <AuthGuard requiredRoles={['admin', 'customer']} redirectTo="/login">
 *   <ProtectedComponent />
 * </AuthGuard>
 */
export default function AuthGuard({
  children,
  requiredRoles,
  redirectTo = '/login',
  fallback = null
}: AuthGuardProps) {
  const { status, profile, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Skip redirects during initial loading
    if (status === 'loading') return;
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      // Store intended destination for post-login redirect
      if (pathname) {
        sessionStorage.setItem('redirectAfterLogin', pathname);
      }
      router.push(redirectTo);
      return;
    }
    
    // Check role requirements if specified
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = profile && requiredRoles.includes(profile.role);
      
      if (!hasRequiredRole) {
        // User doesn't have required role, redirect to appropriate page
        // We might want to redirect to different pages based on their actual role
        if (profile?.role === 'customer') {
          router.push('/customer/dashboard');
        } else if (profile?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/unauthorized');
        }
      }
    }
  }, [status, isAuthenticated, profile, requiredRoles, router, pathname, redirectTo]);
  
  // Show fallback during loading or if not authorized
  if (status === 'loading') {
    return fallback;
  }
  
  // Show fallback if not authenticated
  if (!isAuthenticated) {
    return fallback;
  }
  
  // Show fallback if role check fails
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = profile && requiredRoles.includes(profile.role);
    if (!hasRequiredRole) {
      return fallback;
    }
  }
  
  // User is authenticated and has required role
  return <>{children}</>;
}
