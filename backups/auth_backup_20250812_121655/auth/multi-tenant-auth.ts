/**
 * MULTI-TENANT AUTHENTICATION SYSTEM
 * 
 * This is the core authentication system for the multi-tenant architecture.
 * It handles user authentication, workspace context, and role-based permissions.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UserProfile {
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
}

export interface Workspace {
  id: string;
  slug: string;
  name: string;
  type: 'system' | 'customer';
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'suspended';
  owner_id: string | null;
  billing_email: string | null;
  settings: Record<string, any>;
  features: string[];
  limits: Record<string, any>;
  industry: string | null;
  company_size: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMembership {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: string[];
  invitation_status: 'pending' | 'active' | 'suspended' | 'declined';
  invited_by: string | null;
  invited_at: string;
  joined_at: string | null;
  last_accessed_at: string | null;
  workspace: Workspace;
}

export interface AuthenticatedUser {
  profile: UserProfile;
  memberships: WorkspaceMembership[];
  currentWorkspace: Workspace | null;
  currentMembership: WorkspaceMembership | null;
}

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

export class MultiTenantAuthService {
  private supabase;

  constructor() {
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
      // Get current session
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        return null;
      }

      // Get user profile
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
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
        .eq('user_id', session.user.id)
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
        currentWorkspace = currentMembership.workspace;
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

    const { role, permissions } = user.currentMembership;

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
  }

  /**
   * Switch user's current workspace
   */
  async switchWorkspace(userId: string, workspaceSlug: string): Promise<boolean> {
    try {
      // Verify user has access to this workspace
      const { data: membership } = await this.supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId)
        .eq('invitation_status', 'active')
        .eq('workspace.slug', workspaceSlug)
        .single();

      if (!membership) {
        return false;
      }

      // Update user's default workspace
      const { error } = await this.supabase
        .from('user_profiles')
        .update({ 
          default_workspace_id: membership.workspace_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Failed to switch workspace:', error);
        return false;
      }

      // Update last accessed time
      await this.supabase
        .from('workspace_members')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('workspace_id', membership.workspace_id);

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
 * Get workspace-scoped database client
 */
export function createWorkspaceScopedClient(workspaceId: string) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
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

  // All queries will be automatically filtered by workspace_id through RLS
  return supabase;
}
