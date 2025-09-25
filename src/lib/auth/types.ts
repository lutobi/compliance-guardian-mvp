/**
 * Client-safe auth types for multi-tenant features
 *
 * Note: This file intentionally contains only TypeScript types/interfaces
 * and no server-only imports, so it can be safely imported by client components.
 */

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
