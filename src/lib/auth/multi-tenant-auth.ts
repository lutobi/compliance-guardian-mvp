/**
 * MULTI-TENANT AUTHENTICATION SYSTEM
 * 
 * This is the core authentication system for the multi-tenant architecture.
 * It handles user authentication, workspace context, and role-based permissions.
 */

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Permission, WorkspaceRole, roleHasPermission, validatePermission } from './permissions';
import type { UserProfile, Workspace, WorkspaceMembership, AuthenticatedUser } from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Types are now imported from './types' to ensure a single source of truth
// and client-safe reuse across the app.

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

export class MultiTenantAuthService {
  private supabase;
  private bearerToken: string | null = null;

  constructor() {
    // Prefer Authorization header token if present (API routes with middleware injection)
    try {
      const authHeader = headers().get('authorization') || headers().get('Authorization');
      const bearer = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.substring('Bearer '.length)
        : null;

      if (bearer) {
        this.bearerToken = bearer;
        // Token-authenticated client for API operations where cookies may not be accessible
        this.supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${bearer}`,
              },
            },
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
          }
        );
        return;
      }
    } catch {}

    // Fallback to cookie-based SSR client
    const cookieStore = cookies();
    this.supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
  }

  /**
   * Get the current authenticated user with full workspace context
   */
  async getAuthenticatedUser(workspaceSlug?: string): Promise<AuthenticatedUser | null> {
    try {
      let userId: string | null = null;
      // 1) If we have a bearer token, decode JWT payload to extract user id (sub)
      if (this.bearerToken) {
        try {
          const payloadPart = this.bearerToken.split('.')[1];
          const payloadJson = Buffer.from(payloadPart.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
          const payload = JSON.parse(payloadJson);
          userId = payload?.sub || payload?.user_id || null;
        } catch (e) {
          // Fall through to cookie session
        }
      }

      // 2) Fallback to cookie-based session if no bearer-derived userId
      if (!userId) {
        const { data: { session } } = await this.supabase.auth.getSession();
        userId = session?.user?.id || null;
      }

      if (!userId) {
        return null;
      }

      // Get user profile
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Failed to get user profile:', profileError);
        return null;
      }

      // Get user's workspace memberships
      const { data: memberships, error: membershipsError } = await this.supabase
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

      // Determine current workspace
      let currentWorkspace: Workspace | null = null;
      let currentMembership: WorkspaceMembership | null = null;

      if (workspaceSlug) {
        // Use specified workspace
        const membership = memberships?.find(m => m.workspace.slug === workspaceSlug);
        if (membership) {
          currentWorkspace = membership.workspace;
          currentMembership = membership;
        }
      } else if (profile.default_workspace_id) {
        // Use user's default workspace
        const membership = memberships?.find(m => m.workspace_id === profile.default_workspace_id);
        if (membership) {
          currentWorkspace = membership.workspace;
          currentMembership = membership;
        }
      }

      // If no current workspace, use the most recently accessed one
      if (!currentWorkspace && memberships && memberships.length > 0) {
        currentMembership = memberships[0];
        currentWorkspace = currentMembership?.workspace || null;
      }

      return {
        profile,
        memberships: memberships || [],
        currentWorkspace,
        currentMembership
      };

    } catch (error) {
      console.error('Error getting authenticated user:', error);
      return null;
    }
  }

  /**
   * Check if user has permission for a specific action in current workspace
   */
  async hasPermission(
    user: AuthenticatedUser,
    permission: string,
    resource?: string
  ): Promise<boolean> {
    if (!user.currentMembership) {
      return false;
    }

    // Validate permission string
    if (!validatePermission(permission)) {
      console.warn(`Invalid permission requested: ${permission}`);
      return false;
    }

    const { role, permissions } = user.currentMembership;

    // Check role-based permissions using centralized system
    if (roleHasPermission(role as WorkspaceRole, permission as Permission)) {
      return true;
    }

    // Check custom/additional permissions assigned to user
    if (permissions.includes(permission)) {
      return true;
    }

    // Check resource-based ownership if applicable
    if (resource && this.checkResourceOwnership(user, resource)) {
      return true;
    }

    return false;
  }

  /**
   * Check if user owns a specific resource (for resource-level permissions)
   */
  private checkResourceOwnership(user: AuthenticatedUser, resource: string): boolean {
    // This would be implemented based on specific resource ownership logic
    // For now, return false - can be extended for specific resource types
    return false;
  }

  /**
   * Switch user's current workspace
   */
  async switchWorkspace(userId: string, workspaceSlug: string, retryCount = 0): Promise<boolean> {
    try {
      console.log(`[MultiTenantAuth] Switching workspace to ${workspaceSlug} (attempt ${retryCount + 1})`);
      
      // First get the workspace ID from the slug
      const { data: workspace, error: workspaceError } = await this.supabase
        .from('workspaces')
        .select('id')
        .eq('slug', workspaceSlug)
        .single();

      if (workspaceError || !workspace) {
        console.error('Workspace not found:', workspaceError);
        return false;
      }

      // Verify user has access to this workspace with retry logic for newly created workspaces
      const { data: membership, error: membershipError } = await this.supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId)
        .eq('workspace_id', workspace.id)
        .eq('invitation_status', 'active')
        .single();

      if (membershipError || !membership) {
        // For newly created workspaces, membership might not be immediately available
        // Retry up to 3 times with increasing delays
        if (retryCount < 3) {
          console.log(`[MultiTenantAuth] Membership not found, retrying in ${(retryCount + 1) * 500}ms...`);
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 500));
          return this.switchWorkspace(userId, workspaceSlug, retryCount + 1);
        }
        
        console.error('User does not have access to this workspace after retries:', membershipError);
        return false;
      }

      console.log(`[MultiTenantAuth] Found membership for workspace ${workspace.id}`);

      // Update user's default workspace
      const { error: updateError } = await this.supabase
        .from('user_profiles')
        .update({ 
          default_workspace_id: membership.workspace_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to switch workspace:', updateError);
        return false;
      }

      // Update last accessed time
      await this.supabase
        .from('workspace_members')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('workspace_id', membership.workspace_id);

      console.log(`[MultiTenantAuth] Successfully switched to workspace ${workspaceSlug}`);
      return true;
    } catch (error) {
      console.error('Error switching workspace:', error);
      return false;
    }
  }

  /**
   * Create new workspace with user as owner
   */
  async createWorkspace(
    userId: string,
    name: string,
    slug: string,
    industry?: string,
    companySize?: string
  ): Promise<string | null> {
    try {
      // Call the database function
      const { data, error } = await this.supabase
        .rpc('create_workspace_with_owner', {
          p_user_id: userId,
          p_workspace_name: name,
          p_workspace_slug: slug,
          p_industry: industry,
          p_company_size: companySize
        });

      if (error) {
        console.error('Failed to create workspace:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      return null;
    }
  }

  /**
   * Invite user to workspace
   */
  async inviteUserToWorkspace(
    workspaceId: string,
    email: string,
    role: string,
    invitedBy: string,
    message?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('invite_user_to_workspace', {
          p_workspace_id: workspaceId,
          p_email: email,
          p_role: role,
          p_invited_by: invitedBy,
          p_message: message
        });

      if (error) {
        console.error('Failed to invite user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error inviting user:', error);
      return null;
    }
  }

  /**
   * Accept workspace invitation
   */
  async acceptInvitation(token: string, userId: string): Promise<boolean> {
    try {
      // Get invitation details
      const { data: invitation, error: invitationError } = await this.supabase
        .from('workspace_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (invitationError || !invitation) {
        return false;
      }

      // Create or update workspace membership
      const { error: membershipError } = await this.supabase
        .from('workspace_members')
        .upsert({
          workspace_id: invitation.workspace_id,
          user_id: userId,
          role: invitation.role,
          invitation_status: 'active',
          invited_by: invitation.invited_by,
          joined_at: new Date().toISOString()
        });

      if (membershipError) {
        console.error('Failed to create membership:', membershipError);
        return false;
      }

      // Update invitation status
      await this.supabase
        .from('workspace_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      return true;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return false;
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR ROUTE HANDLERS
// ============================================================================

/**
 * Get authenticated user for API routes
 */
export async function getAuthenticatedUser(workspaceSlug?: string): Promise<AuthenticatedUser | null> {
  const authService = new MultiTenantAuthService();
  return authService.getAuthenticatedUser(workspaceSlug);
}

/**
 * Require authentication and workspace access
 */
export async function requireAuth(workspaceSlug?: string): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(workspaceSlug);
  
  if (!user) {
    redirect('/auth/login');
  }

  return user;
}

/**
 * Require specific permission in current workspace
 */
export async function requirePermission(
  permission: string,
  workspaceSlug?: string,
  resource?: string
): Promise<AuthenticatedUser> {
  const user = await requireAuth(workspaceSlug);
  const authService = new MultiTenantAuthService();
  
  const hasPermission = await authService.hasPermission(user, permission, resource);
  
  if (!hasPermission) {
    redirect('/unauthorized');
  }

  return user;
}

/**
 * API-safe variants: throw typed errors instead of redirecting
 */
export async function requireAuthForApi(workspaceSlug?: string): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(workspaceSlug);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requirePermissionForApi(
  permission: string,
  workspaceSlug?: string,
  resource?: string
): Promise<AuthenticatedUser> {
  const user = await requireAuthForApi(workspaceSlug);
  const authService = new MultiTenantAuthService();
  const ok = await authService.hasPermission(user, permission, resource);
  if (!ok) {
    throw new Error('Access denied');
  }
  return user;
}

/**
 * Get workspace-scoped database client
 */
export function createWorkspaceScopedClient(workspaceId: string) {
  // Prefer Authorization header token if present so RLS uses the authenticated user
  try {
    const authHeader = headers().get('authorization') || headers().get('Authorization');
    const bearer = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : null;
    if (bearer) {
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: { headers: { Authorization: `Bearer ${bearer}` } },
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
        }
      );
    }
  } catch {}

  // Fallback to cookie-based SSR client
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }); },
      },
    }
  );
}
