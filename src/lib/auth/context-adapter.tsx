'use client';

/**
 * LEGACY AUTH CONTEXT ADAPTER
 * 
 * This component bridges the new multi-tenant authentication system with the legacy Auth context.
 * It provides a backward-compatible AuthContext.Provider for components that expect the old context.
 */

import React from 'react';
import { AuthContext, AuthContextType, User } from './context';
import { useMultiTenantAuth } from './MultiTenantContext';
import type { UserProfile as NewUserProfile } from './types';

export function AuthContextAdapter({ children }: { children: React.ReactNode }) {
  const {
    user,
    isAuthenticated,
    loading,
    currentWorkspace,
    currentMembership,
    signIn: multiSignIn,
    signUp: multiSignUp,
    signOut: multiSignOut,
    resetPassword: multiResetPassword,
    updateProfile: multiUpdateProfile,
    refreshUser: multiRefreshUser,
    hasPermission,
  } = useMultiTenantAuth();

  // Map the new auth data to the legacy format
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

  // Legacy wrapper methods
  const signIn = async (email: string, password: string) => {
    await multiSignIn(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await multiSignUp(email, password);
  };

  const signOut = async () => {
    await multiSignOut();
  };

  const resetPassword = async (email: string) => {
    await multiResetPassword(email);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    const newProfileData: Partial<NewUserProfile> = {};
    if (data.name) newProfileData.name = data.name;
    
    await multiUpdateProfile(newProfileData);
  };

  const refreshUser = async () => {
    await multiRefreshUser();
  };

  const hasCapability = (capability: string) => {
    return hasPermission(capability);
  };

  const hasAccess = (level: string) => {
    return hasPermission(level);
  };

  // Determine user role type based on membership role
  const isSystemUser = currentMembership?.role === 'admin' || currentMembership?.role === 'owner';
  const isCustomerUser = !isSystemUser && currentMembership?.role !== undefined;

  // Create legacy context value
  const legacyContext: AuthContextType = {
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
    refreshUser
  };

  return (
    <AuthContext.Provider value={legacyContext}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextAdapter;
