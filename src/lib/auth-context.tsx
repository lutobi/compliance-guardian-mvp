'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useKindeAuth();

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  const signIn = async () => {
    try {
      setLoading(true);
      router.push('/api/auth/login');
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    try {
      setLoading(true);
      router.push('/api/auth/register');
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error('Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      router.push('/api/auth/logout');
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user: isAuthenticated ? {
      id: user?.id || '',
      email: user?.email || '',
      name: user?.given_name
    } : null,
    loading: isLoading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
