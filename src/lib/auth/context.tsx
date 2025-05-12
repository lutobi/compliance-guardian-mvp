'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { AuthService, UserProfile } from '@/services/AuthService';

export interface User {
  id: string;
  email: string;
  name?: string;
  customerId?: string;
  role: {
    name: string;
    capabilities: {
      type: 'system' | 'customer';
      features: string[];
      access: string[];
    };
  };
}

export interface AuthContextType {
  user: User | null;
  isSystemUser: boolean;
  isCustomerUser: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasCapability: (capability: string) => boolean;
  hasAccess: (level: string) => boolean;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authService = AuthService.getInstance();
  const router = useRouter();

  // Convert UserProfile to User interface
  const mapProfileToUser = (profile: UserProfile): User => ({
    id: profile.id,
    email: profile.email,
    name: profile.name,
    customerId: profile.customerId,
    role: {
      name: profile.roleName,
      capabilities: {
        type: profile.userType || 'customer',
        features: profile.features,
        access: profile.access
      }
    }
  });

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await authService.getSession();
      if (error) {
        console.error('Error getting session:', error);
        setUser(null);
        return;
      }
      const session = data.session;
      const authUser = session?.user;
      if (authUser) {
        const profile = await authService.getUserProfile(authUser.id);
        if (profile) {
          setUser(mapProfileToUser(profile));
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [authService]);

  useEffect(() => {
    refreshUser();
    
    const { data: { subscription } } = authService.onAuthStateChange(() => {
      refreshUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await authService.signInWithEmail(email, password);
      if (error) throw error;

      if (data.user) {
        // Client-side role-based routing
        const profile = await authService.getUserProfile(data.user.id);
        if (profile?.userType === 'system') {
          router.push('/system/dashboard');
        } else if (profile?.userType === 'customer') {
          if (profile.workspaceId) {
            router.push('/customer/dashboard');
          } else {
            router.push('/customer/select-workspace');
          }
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);  
    }
  }, [authService, router]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await authService.signOut();
      if (error) throw error;
      setUser(null);
      
      // Use direct navigation for more reliability during sign-out
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
      throw error;
    }
  }, [authService]);

  const isSystemUser = authService.isSystemUser(user ? {
    id: user.id,
    email: user.email,
    userType: user.role.capabilities.type,
    roleId: '',
    roleName: user.role.name,
    permissions: [],
    features: user.role.capabilities.features,
    access: user.role.capabilities.access
  } : null);
  
  const isCustomerUser = authService.isCustomerUser(user ? {
    id: user.id,
    email: user.email,
    userType: user.role.capabilities.type,
    roleId: '',
    roleName: user.role.name,
    permissions: [],
    features: user.role.capabilities.features,
    access: user.role.capabilities.access
  } : null);

  const hasCapability = (capability: string) => {
    return user?.role.capabilities?.features.includes(capability) ?? false;
  };

  const hasAccess = (level: string) => {
    return user?.role.capabilities?.access.includes(level) ?? false;
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    // Get user profile from authService to access permissions
    const userProfile = {
      id: user.id,
      email: user.email,
      userType: user.role.capabilities.type,
      roleId: '',
      roleName: user.role.name,
      permissions: [],  // Will be checked separately
      features: user.role.capabilities.features,
      access: user.role.capabilities.access
    };
    return authService.hasPermission(userProfile, permission);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user?.id) return;
    
    try {
      // Map User to UserProfile for update
      const updateData: Partial<UserProfile> = {};
      if (data.name) updateData.name = data.name;
      
      const result = await authService.updateUserProfile(user.id, updateData);
      if (!result.success) throw new Error('Failed to update profile');
      
      // Refresh user data
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isSystemUser,
        isCustomerUser,
        loading,
        signIn,
        signOut,
        updateProfile,
        hasCapability,
        hasAccess,
        hasPermission,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
