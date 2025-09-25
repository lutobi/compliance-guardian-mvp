/**
 * Centralized Authentication Service
 * 
 * Provides standardized authentication handling, session management,
 * and user profile operations across the application.
 */

import { createClientComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type { Database } from '../database.types';
import { log } from './errorHandler';

export type UserRole = 'admin' | 'customer' | 'system' | 'guest';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  workspace_id?: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Gets the Supabase client for server components and API routes
 */
export function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not set');
  }

  const authHeader = headers().get('authorization');
  const globalHeaders: Record<string, string> = {};
  if (authHeader) {
    globalHeaders['Authorization'] = authHeader;
  }

  // Use pure supabase-js client to avoid cookie side-effects on the server
  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    global: { headers: globalHeaders },
    auth: { persistSession: false },
  });
  return supabase;
}

/**
 * Gets the current session from the server
 */
import { headers } from 'next/headers';

export async function getServerSession() {
  try {
    const supabase = getServerSupabase();
    // Support token-based auth via Authorization header (Bearer <token>)
    // Authorization header already forwarded via getServerSupabase global headers
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      log('error', 'Error getting server session', { error: error.message });
      return { session: null, error };
    }
    
    return { session: data.session, error: null };
  } catch (err: any) {
    log('error', 'Exception getting server session', { error: err.message });
    return { session: null, error: err };
  }
}

/**
 * Gets the current user profile from the server
 * Includes role and workspace information
 */
export async function getServerUserProfile() {
  try {
    const { session, error: sessionError } = await getServerSession();
    
    if (sessionError || !session) {
      return { profile: null, error: sessionError || new Error('No session found') };
    }
    
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error || !data) {
      log('error', 'Error getting user profile', { 
        error: error?.message || 'User not found',
        userId: session.user.id
      });
      return { profile: null, error: error || new Error('User not found') };
    }
    
    const profile: UserProfile = {
      id: data.id,
      email: data.email,
      role: data.role as UserRole,
      workspace_id: data.workspace_id,
      name: data.name,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    return { profile, error: null };
  } catch (err: any) {
    log('error', 'Exception getting server user profile', { error: err.message });
    return { profile: null, error: err };
  }
}

/**
 * Server-side check for required authentication
 * Use this in API routes to require authentication
 */
export async function requireAuthentication() {
  // Always try cookie-based session first as it's more reliable
  log('debug', '[requireAuth] Checking cookie session');
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session }, error } = await supabase.auth.getSession();
  log('debug', '[requireAuth] Cookie session result', { hasSession: !!session, error: error?.message });
  
  if (session?.user && !error) {
    return {
      authenticated: true,
      error: null,
      userId: session.user.id,
    } as const;
  }

  // Fallback to Bearer token validation if cookies fail
  const headersList = headers();
  const authHeader = headersList.get('authorization') || headersList.get('Authorization');
  log('debug', '[requireAuth] Authorization header presence', { hasHeader: !!authHeader });
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    log('debug', '[requireAuth] Validating Bearer token', { tokenPrefix: token?.slice(0, 20) });
    
    try {
      // Create a new Supabase client with the token in headers
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
      
      const tokenSupabase = createClient(supabaseUrl, supabaseKey, {
        global: { 
          headers: { 
            'Authorization': `Bearer ${token}` 
          } 
        },
        auth: { persistSession: false }
      });
      
      const { data: { user }, error: userError } = await tokenSupabase.auth.getUser();
      log('debug', '[requireAuth] getUser with token result', { error: userError?.message, hasUser: !!user });
      
      if (user && !userError) {
        return { authenticated: true, error: null, userId: user.id };
      }
    } catch (tokenError) {
      log('debug', '[requireAuth] Token validation failed', { error: tokenError });
    }
  }

  return {
    authenticated: false,
    error: error || new Error('Authentication required'),
    userId: null,
  } as const;
}

/**
 * Server-side check for required role
 * Use this in API routes to require specific roles
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const { authenticated, error: authError, userId } = await requireAuthentication();
  
  if (!authenticated || authError) {
    return { 
      authorized: false, 
      error: authError, 
      profile: null 
    };
  }
  
  const { profile, error: profileError } = await getServerUserProfile();
  
  if (profileError || !profile) {
    return { 
      authorized: false, 
      error: profileError || new Error('User profile not found'), 
      profile: null 
    };
  }
  
  if (!allowedRoles.includes(profile.role)) {
    return { 
      authorized: false, 
      error: new Error('Insufficient permissions'), 
      profile 
    };
  }
  
  return { authorized: true, error: null, profile };
}

// Cached version of the client-side authentication check
export const getUserProfileCached = cache(async () => {
  try {
    const supabase = createClientComponentClient<Database>();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return { profile: null, error: new Error('No session found') };
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error || !data) {
      return { profile: null, error: error || new Error('User not found') };
    }
    
    const profile: UserProfile = {
      id: data.id,
      email: data.email,
      role: data.role as UserRole,
      workspace_id: data.workspace_id,
      name: data.name,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    return { profile, error: null };
  } catch (err: any) {
    return { profile: null, error: err };
  }
});
