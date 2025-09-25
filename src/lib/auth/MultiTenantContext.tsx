/**
 * MULTI-TENANT AUTH CONTEXT PROVIDER
 * 
 * This replaces the existing auth context with multi-tenant support
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { 
  UserProfile, 
  Workspace, 
  WorkspaceMembership, 
  AuthenticatedUser 
} from '@/lib/auth/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MultiTenantAuthContextType {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  currentWorkspace: Workspace | null;
  currentMembership: WorkspaceMembership | null;
  availableWorkspaces: WorkspaceMembership[];
  loading: boolean;
  error: string | null;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Workspace methods
  switchWorkspace: (workspaceSlug: string) => Promise<boolean>;
  createWorkspace: (name: string, slug: string, industry?: string, companySize?: string) => Promise<string | null>;
  
  // Permission methods
  hasPermission: (permission: string, resource?: string) => boolean;
  hasRole: (role: string) => boolean;
  canManageWorkspace: () => boolean;
  
  // Utility methods
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const MultiTenantAuthContext = createContext<MultiTenantAuthContextType | undefined>(undefined);

export function useMultiTenantAuth() {
  const context = useContext(MultiTenantAuthContext);
  if (context === undefined) {
    throw new Error('useMultiTenantAuth must be used within a MultiTenantAuthProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function MultiTenantAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // (removed duplicate immediate re-hydration; handled in useEffect)
  

  // ------------------------------------------------------------------
  // Re-hydrate Supabase session from localStorage on first mount
  // ------------------------------------------------------------------
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('mt_session') : null;
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session?.access_token && session?.refresh_token) {
          supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
        }
      } catch {
        // invalid JSON – ignore
      }
    }
  }, []);

  // ------------------------------------------------------------------
  // Sync auth events with the server so that server-side API routes
  // receive fresh cookies (required for /api/team/init etc.)
  // ------------------------------------------------------------------
  const lastAccessRef = useRef<string | null>(null);
  const teamInitDoneRef = useRef<boolean>(false);
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // Notify the built-in Next.js callback route to set/clear cookies
      // Only sync when we have a full session (access & refresh tokens) or on SIGNED_OUT
      if ((session?.access_token && session?.refresh_token) || event === 'SIGNED_OUT') {
        // Avoid spamming server with identical SIGNED_IN events
        if (event === 'SIGNED_IN' && session?.access_token === lastAccessRef.current) {
          return;
        }
        if (session?.access_token) {
          lastAccessRef.current = session.access_token;
        }
        // Persist or clear token locally
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('mt_session');
        } else if (session?.access_token && session?.refresh_token) {
          localStorage.setItem('mt_session', JSON.stringify(session));
        }
        fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ event, session }),
        });
      }
    });
    return () => {
      listener.subscription?.unsubscribe();
    };
  }, []);


  // Memoized computed values
  const isAuthenticated = useMemo(() => user !== null, [user]);
  const currentWorkspace = useMemo(() => user?.currentWorkspace || null, [user?.currentWorkspace]);
  const currentMembership = useMemo(() => user?.currentMembership || null, [user?.currentMembership]);
  const availableWorkspaces = useMemo(() => user?.memberships || [], [user?.memberships]);

  // ========================================================================
  // AUTHENTICATION METHODS
  // ========================================================================

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      // Persist tokens from any valid session
      if (session?.access_token && session?.refresh_token) {
        localStorage.setItem('mt_session', JSON.stringify(session));
      }
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setUser(null);
        return;
      }

      if (!session?.user) {
        setUser(null);
        return;
      }

      // Get user profile with better error handling
      let { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        
        // Handle various error cases
        if (profileError.code === 'PGRST116') {
          console.log('Profile not found, will be handled by onboarding/team init');
        } else if (profileError.code === 'PGRST301' || profileError.message?.includes('406')) {
          console.warn('Profile access denied or API error, likely RLS policy issue');
        } else {
          console.warn('Other profile error:', profileError.code, profileError.message);
        }
        
        // Create a minimal temporary profile to prevent app crashes
        profile = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          default_workspace_id: null,
          onboarding_completed: false
        };
        
        console.log('Using temporary profile for session:', profile);
      }

      // Get workspace memberships - handle both possible table names
      let memberships = null;
      let membershipsError = null;
      
      // Get workspace memberships (no embed) to avoid PostgREST embed 500
      const { data: rawMemberships, error: rawMembershipsError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('invitation_status', 'active')
        .order('last_accessed_at', { ascending: false, nullsFirst: false });

      if (rawMembershipsError) {
        membershipsError = rawMembershipsError as any;
      } else {
        // If we have memberships, fetch related workspaces in a second call and stitch client-side
        if (rawMemberships && rawMemberships.length > 0) {
          const workspaceIds = Array.from(new Set(rawMemberships.map(m => m.workspace_id).filter(Boolean)));
          let workspacesData: any[] | null = null;
          let workspacesError: any = null;
          if (workspaceIds.length > 0) {
            const { data: wsData, error: wsErr } = await supabase
              .from('workspaces')
              .select('*')
              .in('id', workspaceIds);
            workspacesData = wsData;
            workspacesError = wsErr;
            if (workspacesError) {
              console.error('Workspaces fetch error:', workspacesError);
            }
          }
          const wsById = new Map((workspacesData || []).map(w => [w.id, w]));
          memberships = rawMemberships.map(m => ({ ...m, workspace: wsById.get(m.workspace_id) || null }));
        } else {
          memberships = [];
        }
      }

      if (membershipsError) {
        console.error('Memberships error:', membershipsError);
        setError('Failed to load workspace memberships');
        // User-friendly fallback to avoid infinite spinners
        toast.error('Unable to load workspace memberships. Redirecting to workspace selector...');
        setTimeout(() => {
          try { router.push('/workspace/select'); } catch {}
        }, 200);
        return;
      }

      // Determine current workspace
      let currentWorkspace: Workspace | null = null;
      let currentMembership: WorkspaceMembership | null = null;

      if (profile.default_workspace_id && memberships) {
        const membership = memberships.find(m => m.workspace_id === profile.default_workspace_id);
        if (membership) {
          currentWorkspace = membership.workspace;
          currentMembership = membership;
        }
      }

      // If no default workspace, use most recently accessed
      if (!currentWorkspace && memberships && memberships.length > 0) {
        currentMembership = memberships[0];
        currentWorkspace = currentMembership?.workspace || null;
      }

      const authenticatedUser: AuthenticatedUser = {
        profile,
        memberships: memberships || [],
        currentWorkspace,
        currentMembership
      };

      setUser(authenticatedUser);

    } catch (error) {
      console.error('Error refreshing user:', error);
      setError('Failed to refresh user data');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('No user data received');
      }

      // Simplified flow: get session immediately after sign-in
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      
      if (!session) {
        throw new Error('No session created after sign-in');
      }

      // Persist session immediately for client-side access
      localStorage.setItem('mt_session', JSON.stringify(session));
      
      // Sync cookies to server and wait for it to complete
      const syncResponse = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ event: 'SIGNED_IN', session }),
      });
      
      if (!syncResponse.ok) {
        console.error('Failed to sync auth session:', await syncResponse.text());
        throw new Error('Failed to synchronize authentication session');
      }
      
      // Give the server a moment to process the session
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Now refresh user data with guaranteed session
      await refreshUser();
      
      // Double-check we have a valid session
      let currentSession = session;
      for (let i = 0; i < 3; i++) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          currentSession = sessionData.session;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      if (!currentSession?.access_token) {
        console.error('No valid session after multiple retries');
        throw new Error('Authentication session not established');
      }
      
      // Initialize team/workspace setup with authenticated session
      if (!teamInitDoneRef.current) {
        teamInitDoneRef.current = true;
        try {
          console.log('[DEBUG] About to call team init with token:', currentSession.access_token ? 'Present' : 'Missing');
          
          const initHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
          if (currentSession?.access_token) {
            initHeaders['Authorization'] = `Bearer ${currentSession.access_token}`;
          }
          const initResponse = await fetch('/api/team/init', {
            method: 'POST',
            headers: initHeaders,
            credentials: 'include'
          });
          
          console.log('[DEBUG] Team init response status:', initResponse.status);
          
          if (initResponse.ok) {
            const initData = await initResponse.json();
            if (initData.success) {
              console.log('[DEBUG] Team init successful, refreshing user data');
              // Refresh user data again to get updated memberships
              await refreshUser();
            } else {
              console.error('[DEBUG] Team init returned success:false:', initData);
            }
          } else {
            const errorText = await initResponse.text();
            console.error('[DEBUG] Team init failed with status:', initResponse.status);
            console.error('[DEBUG] Team init error:', errorText);
          }
        } catch (error) {
          console.warn('Team initialization failed during sign-in:', error);
          // Continue with sign-in flow even if team init fails
        }
      }

      toast.success('Signed in successfully');
      
      // Use the current session we already have instead of fetching again
      if (!currentSession?.user) {
        console.error('[MultiTenant] No session after sign in');
        router.push('/auth/login?error=session_error');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();

      if (!profile) {
        console.log('[MultiTenant] No profile found, redirecting to onboarding');
        router.push('/onboarding');
        return;
      }

      // Get workspace memberships
      const { data: memberships } = await supabase
        .from('workspace_members')
        .select(`
          *,
          workspace:workspaces(*)
        `)
        .eq('user_id', currentSession.user.id)
        .eq('invitation_status', 'active')
        .order('last_accessed_at', { ascending: false, nullsFirst: false });

      console.log('[MultiTenant] Fresh data after sign in:', { 
        profileId: profile.id,
        defaultWorkspaceId: profile.default_workspace_id,
        membershipCount: memberships?.length || 0,
        memberships: memberships?.map(m => ({ id: m.workspace_id, slug: m.workspace.slug }))
      });

      // Determine current workspace
      let currentWorkspaceSlug: string | null = null;
      
      if (profile.default_workspace_id && memberships) {
        const defaultMembership = memberships.find(m => m.workspace_id === profile.default_workspace_id);
        if (defaultMembership) {
          currentWorkspaceSlug = defaultMembership.workspace.slug;
        }
      }

      // If no default workspace, use most recently accessed
      if (!currentWorkspaceSlug && memberships && memberships.length > 0) {
        currentWorkspaceSlug = memberships[0].workspace.slug;
      }

      // Make redirection decision based on fresh data
      if (currentWorkspaceSlug) {
        console.log('[MultiTenant] User has workspace, redirecting to dashboard:', currentWorkspaceSlug);
        // Use a small delay to ensure all auth state is set
        setTimeout(() => {
          router.push(`/workspace/${currentWorkspaceSlug}/dashboard`);
        }, 100);
      } else if (memberships && memberships.length > 0) {
        console.log('[MultiTenant] User has workspaces but no default, redirecting to selection');
        setTimeout(() => {
          router.push('/workspace/select');
        }, 100);
      } else {
        console.log('[MultiTenant] No workspaces found, redirecting to selection');
        setTimeout(() => {
          router.push('/workspace/select');
        }, 100);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || ''
          }
        }
      });

      if (error) {
        setError(error.message);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('No user data received');
      }

      toast.success('Account created successfully! Check your email to verify your account.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      // Clear local storage workspace preferences
      localStorage.removeItem('lastWorkspace');
      
      // First, sync logout with server-side session
      const { error: callbackError } = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event: 'SIGNED_OUT' })
      }).then(res => res.json());
      
      if (callbackError) {
        console.warn('Server session sync error:', callbackError);
      }
      
      // Then client-side logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }

      // Clear user state
      setUser(null);
      toast.success('Signed out successfully');
      
      // Delay redirect slightly to allow cookies to clear
      setTimeout(() => {
        router.replace('/auth/login');
      }, 100);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        setError(error.message);
        throw new Error(error.message);
      }

      toast.success('Password reset email sent');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================================================
  // WORKSPACE METHODS
  // ========================================================================

  const switchWorkspace = useCallback(async (workspaceSlug: string, skipMembershipCheck = false): Promise<boolean> => {
    try {
      console.log('[MultiTenant] Switching workspace to:', workspaceSlug);
      
      if (!user) {
        console.error('[MultiTenant] Cannot switch workspace - no authenticated user');
        return false;
      }

      // For newly created workspaces, we may need to skip the initial check since the state may not be updated yet
      // For workspace switching after creation, we skip the membership check initially
      // because the state might not be updated yet
      let targetMembership;
      
      if (!skipMembershipCheck) {
        // Check if user has membership to the target workspace
        targetMembership = user.memberships.find(m => m.workspace.slug === workspaceSlug);
        if (!targetMembership) {
          console.error('[MultiTenant] User does not have access to workspace:', workspaceSlug);
          toast.error('You do not have access to this workspace');
          return false;
        }
        // Logged earlier if !skipMembershipCheck
      } else {
        console.log('[MultiTenant] Skipping initial membership check for newly created workspace');
      }

      // For toast messages, we need to find the workspace name if possible
      let workspaceName = workspaceSlug;
      if (!skipMembershipCheck && targetMembership?.workspace?.name) {
        workspaceName = targetMembership.workspace.name;
      }
      
      // Before calling the switch API, make sure the server sees the latest session cookies.
      // This avoids 401s if the app just mounted or after a token refresh.
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        if (session?.access_token && session?.refresh_token) {
          await fetch('/api/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ event: 'TOKEN_REFRESHED', session }),
          });
          // Small delay to let cookies propagate
          await new Promise((r) => setTimeout(r, 150));
        }
      } catch (e) {
        console.warn('[MultiTenant] Cookie sync before switch failed (non-fatal):', e);
      }

      // Call server API to perform the switch and invalidate server-side cache
      console.log('[MultiTenant] Calling workspace switch API...');
      const res = await fetch('/api/workspace/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ workspaceSlug })
      });

      if (!res.ok) {
        let message = 'Failed to switch workspace';
        try {
          const data = await res.json();
          message = data?.error || message;
          console.error('[MultiTenant] Switch API error:', data);
        } catch (parseError) {
          console.error('[MultiTenant] Failed to parse API error:', parseError);
        }
        toast.error(message);
        return false;
      }

      // Refresh user data to reflect the change
      console.log('[MultiTenant] Workspace switch API successful, refreshing user data');
      await refreshUser();

      // Persist last selected workspace locally for convenience
      try {
        localStorage.setItem('lastWorkspace', workspaceSlug);
        console.log('[MultiTenant] Saved last workspace to localStorage:', workspaceSlug);
      } catch (storageError) {
        console.warn('[MultiTenant] Failed to save workspace to localStorage:', storageError);
      }

      // The user state will be updated by the refreshUser call.
      // The UI will reactively update once the new state is available.
      console.log('[MultiTenant] Workspace switch process complete.');
      toast.success(`Switched to ${workspaceName}`);
      return true;

    } catch (error) {
      console.error('[MultiTenant] Error switching workspace:', error);
      toast.error('Failed to switch workspace');
      return false;
    }
  }, [user, refreshUser]);

  const createWorkspace = useCallback(async (
    name: string, 
    slug: string, 
    industry?: string, 
    companySize?: string
  ): Promise<string | null> => {
    try {
      console.log('[MultiTenant] Creating new workspace:', { name, slug, industry, companySize });
      
      if (!user) {
        console.error('[MultiTenant] Cannot create workspace - no authenticated user');
        return null;
      }

      // Call the database function to create workspace
      console.log('[MultiTenant] Calling RPC function to create workspace');
      const { data, error } = await supabase.rpc('create_workspace_with_owner', {
        p_user_id: user.profile.id,
        p_workspace_name: name,
        p_workspace_slug: slug,
        p_industry: industry || null,
        p_company_size: companySize || null,
        p_subscription_tier: 'free'
      });

      if (error) {
        console.error('[MultiTenant] Failed to create workspace:', error);
        let errorMessage = 'Failed to create workspace';
        
        // Handle common errors with more specific messages
        if (error.message.includes('duplicate key')) {
          errorMessage = 'A workspace with this name or slug already exists';
        } else if (error.message.includes('permission denied')) {
          errorMessage = 'You do not have permission to create a workspace';
        }
        
        toast.error(errorMessage);
        return null;
      }

      console.log('[MultiTenant] Workspace created successfully, ID:', data);
      toast.success(`Workspace "${name}" created successfully`);

      // Directly switch to the newly created workspace.
      // The switchWorkspace function is responsible for refreshing the user state.
      console.log('[MultiTenant] Switching to newly created workspace:', slug);
      const switched = await switchWorkspace(slug, true);
      
      if (!switched) {
        console.error('[MultiTenant] Created workspace but failed to switch context');
        toast.warning('Workspace created but failed to establish context. Please refresh and try again.');
      } else {
        console.log('[MultiTenant] Successfully switched to new workspace');
      }

      return data;

    } catch (error) {
      console.error('[MultiTenant] Error creating workspace:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create workspace');
      return null;
    }
  }, [user, refreshUser, switchWorkspace]);

  // ========================================================================
  // PERMISSION METHODS
  // ========================================================================

  const hasPermission = useCallback((permission: string, resource?: string): boolean => {
    if (!currentMembership) return false;

    const { role, permissions } = currentMembership;

    // Owner and admin have all permissions
    if (role === 'owner' || role === 'admin') {
      return true;
    }

    // Check specific permissions
    if (permissions.includes(permission)) {
      return true;
    }

    // Role-based permissions
    switch (permission) {
      case 'read':
        return ['owner', 'admin', 'editor', 'viewer'].includes(role);
      case 'write':
      case 'create':
      case 'update':
        return ['owner', 'admin', 'editor'].includes(role);
      case 'delete':
        return ['owner', 'admin'].includes(role);
      case 'manage_users':
      case 'manage_billing':
      case 'manage_settings':
        return ['owner', 'admin'].includes(role);
      default:
        return false;
    }
  }, [currentMembership]);

  const hasRole = useCallback((role: string): boolean => {
    return currentMembership?.role === role || false;
  }, [currentMembership]);

  const canManageWorkspace = useCallback((): boolean => {
    return hasPermission('manage_settings');
  }, [hasPermission]);

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<void> => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.profile.id);

      if (error) {
        console.error('Failed to update profile:', error);
        toast.error('Failed to update profile');
        return;
      }

      // Refresh user data
      await refreshUser();
      toast.success('Profile updated successfully');

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  }, [user, refreshUser]);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    // Initial user load
    refreshUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      
      if (event === 'SIGNED_IN') {
        refreshUser();
        // Do not force a navigation here. Let pages decide where to go based on memberships/profile.
        // This avoids race conditions that can push users away from intended routes
        // like /workspace/select during E2E and onboarding flows.
        // If needed in the future, add a targeted redirect only from auth pages.
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshUser]);

  // ========================================================================
  // PROVIDER VALUE
  // ========================================================================

  const contextValue: MultiTenantAuthContextType = {
    user,
    isAuthenticated,
    currentWorkspace,
    currentMembership,
    availableWorkspaces,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    switchWorkspace,
    createWorkspace,
    hasPermission,
    hasRole,
    canManageWorkspace,
    refreshUser,
    updateProfile
  };

  return (
    <MultiTenantAuthContext.Provider value={contextValue}>
      {children}
    </MultiTenantAuthContext.Provider>
  );
}
