/**
 * COMPATIBILITY LAYER FOR LEGACY AUTH
 * 
 * This hook provides backward compatibility for components still using the old useAuth hook.
 * It redirects all calls to the new useMultiTenantAuth hook and maps the return values to match
 * the expected format of the old useAuth hook.
 */

'use client';

import { useMultiTenantAuth } from '@/lib/auth/MultiTenantContext';
import type { User } from '@/lib/auth/context';

// Types needed for backward compatibility
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// Legacy UserProfile type for compatibility
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  workspace_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Mock Session type for compatibility
export interface Session {
  user: {
    id: string;
    email: string;
  };
  expires_at?: number;
}

// Legacy return type expected by components using useAuth
export interface UseAuthReturn {
  user: User | null;
  isSystemUser: boolean;
  isCustomerUser: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasCapability: (capability: string) => boolean;
  hasAccess: (level: string) => boolean;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
  
  // Additional fields for apps expecting the hooks/useAuth.ts version
  session: Session | null;
  profile: UserProfile | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refreshProfile: () => Promise<void>;
}

/**
 * Legacy useAuth hook compatibility layer
 * This redirects all calls to the new useMultiTenantAuth hook
 */
export function useAuth(): UseAuthReturn {
  // Use the new multi-tenant auth context
  const {
    user,
    loading,
    isAuthenticated,
    error: authError,
    signIn,
    signOut,
    signUp,
    resetPassword,
    refreshUser,
    hasPermission,
    currentWorkspace,
    currentMembership,
    updateProfile: updateUserProfile
  } = useMultiTenantAuth();
  
  // Convert the new user type to the old user type
  const legacyUser: User | null = user ? {
    id: user.profile.id,
    email: user.profile.email,
    name: user.profile.name || undefined,
    customerId: currentWorkspace?.id,
    role: {
      name: currentMembership?.role || 'member',
      capabilities: {
        type: (currentMembership?.role === 'admin' || currentMembership?.role === 'owner') ? 'system' : 'customer',
        features: [],
        access: []
      }
    }
  } : null;
  
  // Create a mock session for legacy components
  const mockSession: Session | null = user ? {
    user: {
      id: user.profile.id,
      email: user.profile.email
    }
  } : null;
  
  // Convert profile for legacy components
  const legacyProfile: UserProfile | null = user ? {
    id: user.profile.id,
    email: user.profile.email,
    name: user.profile.name || undefined,
    workspace_id: currentWorkspace?.id,
    role: currentMembership?.role,
    created_at: user.profile.created_at,
    updated_at: user.profile.updated_at
  } : null;
  
  // Map auth status for legacy components
  const authStatus: AuthStatus = loading ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated';
  
  // Compatibility wrappers for legacy methods
  const hasCapability = (capability: string): boolean => {
    return hasPermission(capability);
  };
  
  const hasAccess = (level: string): boolean => {
    return hasPermission(level);
  };
  
  // For legacy components expecting this method
  const refreshProfile = async (): Promise<void> => {
    await refreshUser();
  };
  
  // For legacy components expecting this method
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!user) return;
    
    await updateUserProfile({
      name: data.name
    });
  };
  
  // Determine user role type based on membership role
  const isSystemUser = currentMembership?.role === 'admin' || currentMembership?.role === 'owner';
  const isCustomerUser = !isSystemUser && currentMembership?.role !== undefined;
  
  return {
    // New auth context properties
    user: legacyUser,
    isSystemUser,
    isCustomerUser,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    hasCapability,
    hasAccess,
    hasPermission,
    refreshUser,
    
    // Legacy properties for old hook users
    session: mockSession,
    profile: legacyProfile,
    status: authStatus,
    isLoading: loading,
    isAuthenticated,
    error: authError ? new Error(authError) : null,
    refreshProfile
  };
}

export default useAuth;
