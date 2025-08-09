'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { AuthProvider } from '@/lib/auth/context';

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

  // Initialize team when user is authenticated (with improved error handling and retry logic)
  useEffect(() => {
    let initialized = false;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds
    
    const initializeTeam = async () => {
      if (authState.user && !authState.loading && !initialized) {
        try {
          console.log('Attempting team initialization...');
          const response = await fetch('/api/team/init', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            initialized = true;
            console.log('Team initialization successful');
            return true;
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error(`Team initialization failed: ${response.status}`, errorData);
            
            // Only retry for specific error codes that might be temporary
            if (response.status >= 500 && retryCount < MAX_RETRIES) {
              return false; // Signal for retry
            }
            return true; // Don't retry for 4xx errors
          }
        } catch (error) {
          console.error('Team initialization error:', error);
          return retryCount < MAX_RETRIES; // Retry network errors
        }
      }
      return true; // No need to retry if not authenticated or already initialized
    };
    
    // Implement retry with exponential backoff
    const attemptInitWithRetry = async () => {
      const success = await initializeTeam();
      
      if (!success && retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying team initialization (${retryCount}/${MAX_RETRIES}) in ${RETRY_DELAY}ms`);
        
        // Use setTimeout for retry with delay
        setTimeout(attemptInitWithRetry, RETRY_DELAY * retryCount);
      }
    };
    
    attemptInitWithRetry();
    
    // Cleanup function to prevent memory leaks
    return () => {
      initialized = true; // Prevent further initialization attempts
    };
  }, [authState.user, authState.loading]);

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

  // The AuthProvider is already provided in src/app/providers.tsx
  return (
    <>
      {children}
    </>
  );
}
