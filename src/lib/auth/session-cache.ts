/**
 * SESSION CACHING SYSTEM
 * 
 * Implements efficient caching for user session data to avoid
 * database queries on every middleware request
 */

import type { AuthenticatedUser, WorkspaceMembership } from './types';

// In-memory cache for session data (can be replaced with Redis in production)
class SessionCache {
  private cache = new Map<string, CachedSession>();
  private readonly TTL = 15 * 60 * 1000; // 15 minutes

  set(userId: string, sessionData: CachedSession) {
    sessionData.expiresAt = Date.now() + this.TTL;
    this.cache.set(userId, sessionData);
  }

  get(userId: string): CachedSession | null {
    const cached = this.cache.get(userId);
    
    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(userId);
      return null;
    }

    return cached;
  }

  delete(userId: string) {
    this.cache.delete(userId);
  }

  clear() {
    this.cache.clear();
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    for (const [userId, session] of this.cache.entries()) {
      if (now > session.expiresAt) {
        this.cache.delete(userId);
      }
    }
  }
}

interface CachedSession {
  profile: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    default_workspace_id: string | null;
    timezone: string;
    locale: string;
    theme: 'light' | 'dark' | 'system';
    settings: Record<string, any>;
    onboarding_completed: boolean;
    last_active_at: string | null;
    created_at: string;
    updated_at: string;
  };
  memberships: WorkspaceMembership[];
  expiresAt: number;
}

// Global cache instance
const sessionCache = new SessionCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  sessionCache.cleanup();
}, 5 * 60 * 1000);

/**
 * Get cached session data for user
 */
export function getCachedSession(userId: string): CachedSession | null {
  return sessionCache.get(userId);
}

/**
 * Cache session data for user
 */
export function setCachedSession(userId: string, profile: any, memberships: WorkspaceMembership[]) {
  const sessionData: CachedSession = {
    profile,
    memberships,
    expiresAt: 0 // Will be set by cache.set()
  };
  
  sessionCache.set(userId, sessionData);
}

/**
 * Invalidate cached session for user (call when user data changes)
 */
export function invalidateSession(userId: string) {
  sessionCache.delete(userId);
}

/**
 * Clear all cached sessions (call for security events)
 */
export function clearAllSessions() {
  sessionCache.clear();
}

/**
 * Convert cached session to AuthenticatedUser format
 */
export function sessionToAuthenticatedUser(
  cached: CachedSession, 
  workspaceSlug?: string
): AuthenticatedUser {
  // Find current workspace and membership
  let currentWorkspace = null;
  let currentMembership = null;

  if (workspaceSlug) {
    currentMembership = cached.memberships.find(m => 
      m.workspace.slug === workspaceSlug && m.invitation_status === 'active'
    ) || null;
    currentWorkspace = currentMembership?.workspace || null;
  } else if (cached.profile.default_workspace_id) {
    // Use default workspace
    currentMembership = cached.memberships.find(m => 
      m.workspace_id === cached.profile.default_workspace_id && 
      m.invitation_status === 'active'
    ) || null;
    currentWorkspace = currentMembership?.workspace || null;
  } else {
    // Use first available workspace
    currentMembership = cached.memberships.find(m => m.invitation_status === 'active') || null;
    currentWorkspace = currentMembership?.workspace || null;
  }

  return {
    profile: cached.profile,
    memberships: cached.memberships,
    currentWorkspace,
    currentMembership
  };
}

/**
 * Enhanced session management with cache-first strategy
 */
export async function getOrFetchUserSession(
  userId: string,
  supabaseClient: any,
  workspaceSlug?: string
): Promise<AuthenticatedUser | null> {
  // Try cache first
  const cached = getCachedSession(userId);
  if (cached) {
    return sessionToAuthenticatedUser(cached, workspaceSlug);
  }

  // Cache miss - fetch from database
  try {
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return null;
    }

    const { data: memberships, error: membershipsError } = await supabaseClient
      .from('workspace_members')
      .select(`
        *,
        workspace:workspaces(*)
      `)
      .eq('user_id', userId)
      .eq('invitation_status', 'active')
      .order('last_accessed_at', { ascending: false, nullsFirst: false });

    if (membershipsError) {
      console.error('Failed to get workspace memberships:', membershipsError);
      return null;
    }

    // Cache the fetched data
    setCachedSession(userId, profile, memberships || []);

    // Convert to AuthenticatedUser format
    return sessionToAuthenticatedUser({ 
      profile, 
      memberships: memberships || [], 
      expiresAt: 0 
    }, workspaceSlug);

  } catch (error) {
    console.error('Error fetching user session:', error);
    return null;
  }
}
