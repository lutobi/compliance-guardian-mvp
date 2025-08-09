/**
 * Centralized Authentication Service
 * 
 * Provides standardized authentication handling, session management,
 * and user profile operations across the application.
 */

import { createClientComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
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
  const supabase = createRouteHandlerClient<Database>({ cookies });
  return supabase;
}

/**
 * Gets the current session from the server
 */
export async function getServerSession() {
  try {
    const supabase = getServerSupabase();
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
      .from('users')
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
  const { session, error } = await getServerSession();
  
  if (error || !session) {
    return { 
      authenticated: false, 
      error: error || new Error('Authentication required'), 
      userId: null 
    };
  }
  
  return { 
    authenticated: true, 
    error: null, 
    userId: session.user.id 
  };
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
      .from('users')
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
