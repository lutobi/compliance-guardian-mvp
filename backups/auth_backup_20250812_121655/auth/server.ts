/**
 * Server-side authentication utilities for API routes
 */
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';
import { log } from '@/lib/services/errorHandler';

export interface ServerAuthUser {
  id: string;
  email: string;
  workspaceId?: string;
  customerId?: string;
  role?: string;
  permissions?: string[];
}

/**
 * Get the authenticated user from the request
 * For use in server components and API routes
 */
export async function auth(): Promise<ServerAuthUser | null> {
  const cookieStore = cookies();
  
  // Create a Supabase client for server-side usage
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      log('error', 'Error getting session in server auth', { error: sessionError });
      return null;
    }
    
    if (!session) {
      return null;
    }
    
    // Get user profile from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role_id, workspace_id, roles(name, type)')
      .eq('id', session.user.id)
      .single();
      
    if (userError) {
      log('error', 'Error getting user data in server auth', { error: userError });
      return null;
    }
    
    // Get customer ID if this is a customer user with a workspace
    let customerId: string | undefined = undefined;
    
    if (userData.workspace_id && userData.roles?.type === 'customer') {
      const { data: custData } = await supabase
        .from('customers')
        .select('id')
        .eq('workspace_id', userData.workspace_id)
        .single();
        
      if (custData) {
        customerId = custData.id;
      }
    }
    
    return {
      id: userData.id,
      email: userData.email,
      workspaceId: userData.workspace_id,
      customerId: customerId,
      role: userData.roles?.name
    };
  } catch (error: any) {
    log('error', 'Unexpected error in server auth', { error: error.message });
    return null;
  }
}
