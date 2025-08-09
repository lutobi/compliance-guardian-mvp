/**
 * Authentication Hook for Client Components
 * 
 * Provides a consistent way for client components to access authentication state,
 * user profile information, and handle auth-related operations.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import type { UserProfile } from '@/lib/services/authService';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface UseAuthReturn {
  session: Session | null;
  profile: UserProfile | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<Error | null>(null);
  
  // Load the session and profile
  useEffect(() => {
    let mounted = true;
    
    async function getSession() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(currentSession);
          
          if (currentSession) {
            fetchProfile(currentSession.user.id);
          } else {
            setStatus('unauthenticated');
          }
        }
      } catch (e: any) {
        if (mounted) {
          setError(e);
          setStatus('unauthenticated');
        }
      }
    }
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession);
      
      if (newSession) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
        setStatus('unauthenticated');
      }
    });
    
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);
  
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      setStatus('loading');
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          role: data.role,
          workspace_id: data.workspace_id,
          name: data.name || undefined,
          avatar_url: data.avatar_url || undefined,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
        setStatus('authenticated');
      } else {
        setProfile(null);
        setStatus('unauthenticated');
      }
    } catch (e: any) {
      setError(e);
      setProfile(null);
      setStatus('unauthenticated');
    }
  }, [supabase]);
  
  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  }, [session, fetchProfile]);
  
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (e: any) {
      setError(e);
    }
  }, [supabase, router]);
  
  return {
    session,
    profile,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    error,
    refreshProfile,
    signOut
  };
}

export default useAuth;
