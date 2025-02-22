'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'sonner';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authState, setAuthState] = useState<{
    user: User | null;
    loading: boolean;
  }>({
    user: null,
    loading: true,
  });

  const supabase = createClientComponentClient();

  const initializeAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error('Error getting session:', error);
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, [supabase.auth]);

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(prev => ({ ...prev, user: session?.user ?? null }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, initializeAuth]);

  return (
    <AuthProvider initialUser={authState.user} loading={authState.loading}>
      {children}
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
