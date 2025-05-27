import type { 
  User, 
  Session,
  AuthResponse,
  AuthTokenResponse,
  AuthError
} from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { UserRole } from '@/types/roles';
import { supabase } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  userType: 'system' | 'customer' | null;
  roleId: string;
  roleName: string;
  workspaceId?: string;
  customerId?: string;
  permissions: string[];
  features: string[];
  access: string[];
}

export class AuthService {
  private static instance: AuthService;
  private userProfileCache: Map<string, { profile: UserProfile; timestamp: number }> = new Map();
  private authAttempts: Map<string, { timestamp: number; count: number }> = new Map();
  private readonly MAX_ATTEMPTS = 3;
  private readonly WINDOW_MS = 60000; // 1 minute window
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private supabase = supabase;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.authAttempts.get(identifier);

    if (!attempt) {
      this.authAttempts.set(identifier, { timestamp: now, count: 1 });
      return true;
    }

    if (now - attempt.timestamp > this.WINDOW_MS) {
      // Reset if window has passed
      this.authAttempts.set(identifier, { timestamp: now, count: 1 });
      return true;
    }

    if (attempt.count >= this.MAX_ATTEMPTS) {
      const timeLeft = Math.ceil((this.WINDOW_MS - (now - attempt.timestamp)) / 1000);
      throw new Error(`Too many login attempts. Please try again in ${timeLeft} seconds.`);
    }

    // Increment attempt count
    this.authAttempts.set(identifier, {
      timestamp: attempt.timestamp,
      count: attempt.count + 1
    });
    return true;
  }

  async signInWithEmail(email: string, password: string): Promise<AuthTokenResponse> {
    try {
      this.checkRateLimit(email.toLowerCase());

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Pre-fetch and cache user profile for faster access
      if (data.user) {
        await this.getUserProfile(data.user.id);
      }

      return {
        data: {
          user: data.user,
          session: data.session
        },
        error: null
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('too many requests')) {
        throw new Error('Login rate limit reached. Please try again in a minute.');
      }
      throw error;
    }
  }

  async signUp(email: string, password: string, userData?: { name?: string }): Promise<AuthResponse> {
    try {
      this.checkRateLimit(email.toLowerCase());

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          data: userData
        },
      });

      if (error) {
        throw error;
      }

      // Auto-populate custom users table with default Customer role
      if (data.user) {
        const roles = await this.getAllRoles();
        const customerRole = roles.find(r => r.name === 'Customer');
        if (customerRole) {
          const { error: insertErr } = await this.supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                role_id: customerRole.id
              }
            ]);
          if (insertErr) console.error('[signUp] error inserting user role:', insertErr);
        }
      }

      return { data, error: null };
    } catch (error) {
      if (error instanceof Error && error.message.includes('too many requests')) {
        throw new Error('Sign up rate limit reached. Please try again in a minute.');
      }
      throw error;
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    const { data } = await this.supabase.auth.getSession();
    if (data.session?.user) {
      this.userProfileCache.delete(data.session.user.id);
    }
    return this.supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<void> {
    try {
      this.checkRateLimit(email.toLowerCase());

      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('too many requests')) {
        throw new Error('Reset password rate limit reached. Please try again in a minute.');
      }
      throw error;
    }
  }

  async getSession(): Promise<AuthTokenResponse> {
    return this.supabase.auth.getSession();
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    // debug: start fetching profile
    console.log('[getUserProfile] start for', userId);
    // Check cache first
    const cached = this.userProfileCache.get(userId);
    const now = Date.now();
    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.profile;
    }
    try {
      // 1. Fetch basic user info
      console.log('[getUserProfile] querying users table');
      // Fetch a single custom user record
      const { data: userData, error: userErr } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      let userRow = userData;
      if (userErr) {
        console.error('[getUserProfile] Error fetching user row:', userErr.message, userErr.details);
        return null;
      }
      // If no custom user, insert a new one with default Customer role
      if (!userRow) {
        console.warn('[getUserProfile] no custom user record, creating new one');
        const { data: authUserRes, error: authUserErr } = await this.supabase.auth.getUser();
        if (authUserErr || !authUserRes.user) {
          console.error('[getUserProfile] Error fetching auth user:', authUserErr);
          return null;
        }
        const authUser = authUserRes.user;
        // Look up Customer role
        const { data: customerRoleData, error: roleFetchErr } = await this.supabase
          .from('roles')
          .select('id')
          .eq('name', 'Customer')
          .single();
        const defaultRoleId = customerRoleData?.id ?? '';
        // Insert into public.users
        const { error: insertErr } = await this.supabase
          .from('users')
          .upsert({ id: authUser.id, email: authUser.email!, role_id: defaultRoleId }, { onConflict: ['email'] });
        if (insertErr) console.error('[getUserProfile] Error inserting new user:', insertErr);
        userRow = { id: authUser.id, email: authUser.email!, workspace_id: null, role_id: defaultRoleId } as any;
      }
      // 2. Determine role info with safe fallback
      let roleRow: { id: string; name: string; capabilities: { type: string; features: string[]; access: string[] } };
      const hasRoleId = typeof (userRow as any).role_id === 'string' && (userRow as any).role_id.trim().length > 0;
      if (hasRoleId) {
        const roleIdValue = (userRow as any).role_id;
        console.log('[getUserProfile] querying roles table for', roleIdValue);
        const { data: rawRole, error: roleErr } = await this.supabase
          .from('roles')
          .select('id, name, capabilities')
          .eq('id', roleIdValue)
          .maybeSingle();
        if (roleErr || !rawRole) {
          console.warn('[getUserProfile] roles query error or no data, defaulting to customer:', roleErr);
          roleRow = { id: '', name: 'Customer', capabilities: { type: 'customer', features: [], access: [] } };
        } else {
          const caps = rawRole.capabilities as any;
          roleRow = {
            id: rawRole.id,
            name: rawRole.name,
            capabilities: {
              type: typeof caps.type === 'string' ? caps.type : 'customer',
              features: Array.isArray(caps.features) ? caps.features : [],
              access: Array.isArray(caps.access) ? caps.access : []
            }
          };
        }
      } else {
        console.warn('[getUserProfile] no valid role_id, defaulting to Customer role');
        roleRow = { id: '', name: 'Customer', capabilities: { type: 'customer', features: [], access: [] } };
      }
      // Build profile
      const profile: UserProfile = {
        id: userRow.id,
        email: userRow.email,
        name: undefined,
        userType: (roleRow.capabilities?.type as 'system' | 'customer') || null,
        roleId: roleRow.id,
        roleName: roleRow.name,
        workspaceId: userRow.workspace_id || undefined,
        permissions: [],
        features: roleRow.capabilities?.features || [],
        access: roleRow.capabilities?.access || []
      };
      console.log('[getUserProfile] built profile', profile);
      // If customer, fetch customer ID
      if (profile.userType === 'customer' && profile.workspaceId) {
        console.log('[getUserProfile] querying customers table for workspace', profile.workspaceId);
        const { data: custRow, error: custErr } = await this.supabase
          .from('customers')
          .select('id')
          .eq('workspace_id', profile.workspaceId)
          .single();
        if (custErr) {
          console.error('[getUserProfile] Error fetching customer row:', custErr.message, custErr.details);
        } else if (custRow) {
          profile.customerId = custRow.id;
          console.log('[getUserProfile] got customerId', profile.customerId);
        }
      }
      // Map permissions based on role name
      try {
        const roleKey = profile.roleName.toUpperCase().replace(/\s+/g, '_') as keyof typeof UserRole;
        if (UserRole[roleKey]) profile.permissions = this.getRolePermissions(UserRole[roleKey]);
      } catch (e) {
        console.error('[getUserProfile] Error mapping permissions:', e);
      }
      // Cache and return
      this.userProfileCache.set(userId, { profile, timestamp: now });
      console.log('[getUserProfile] cached and returning profile');
      return profile;
    } catch (err: any) {
      console.error('[getUserProfile] Unexpected error:', err.message, err);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      // Update the users table
      const { error } = await this.supabase
        .from('users')
        .update({
          name: updates.name,
          role_id: updates.roleId,
          workspace_id: updates.workspaceId
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Clear cache for this user
      this.userProfileCache.delete(userId);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error };
    }
  }

  async getAllRoles() {
    try {
      const { data, error } = await this.supabase
        .from('roles')
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  hasPermission(profile: UserProfile | null, permission: string): boolean {
    if (!profile) return false;
    return profile.permissions.includes(permission);
  }

  hasFeature(profile: UserProfile | null, feature: string): boolean {
    if (!profile) return false;
    return profile.features.includes(feature);
  }

  hasAccess(profile: UserProfile | null, accessLevel: string): boolean {
    if (!profile) return false;
    return profile.access.includes(accessLevel);
  }

  isSystemUser(profile: UserProfile | null): boolean {
    return profile?.userType === 'system';
  }

  isCustomerUser(profile: UserProfile | null): boolean {
    return profile?.userType === 'customer';
  }

  clearCache(userId?: string) {
    if (userId) {
      this.userProfileCache.delete(userId);
    } else {
      this.userProfileCache.clear();
    }
  }

  private getRolePermissions(role: UserRole): string[] {
    const permissionsMap: Record<UserRole, string[]> = {
      [UserRole.SYSTEM_ADMIN]: [
        'access_all_system_features',
        'manage_system_users',
        'configure_frameworks',
        'view_all_customers',
        'manage_customer_access'
      ],
      [UserRole.SYSTEM_DEVELOPER]: [
        'access_system_features',
        'develop_frameworks',
        'view_customer_data',
        'test_features'
      ],
      [UserRole.CUSTOMER_ADMIN]: [
        'manage_customer_users',
        'configure_customer_settings',
        'view_customer_reports',
        'manage_compliance'
      ],
      [UserRole.CUSTOMER_MANAGER]: [
        'manage_compliance',
        'view_reports',
        'submit_evidence',
        'monitor_status'
      ],
      [UserRole.CUSTOMER_USER]: [
        'view_compliance',
        'submit_evidence',
        'view_dashboard'
      ]
    };

    return permissionsMap[role] || [];
  }
}
