import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { PostgrestError, User } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import jwt from 'jsonwebtoken';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Ensure this route is always executed dynamically (no caching of headers/cookies)
export const dynamic = 'force-dynamic';

interface RequestBody {
  workspaceName?: string;
  workspaceSlug?: string;
  industry?: string;
  companySize?: string;
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
}

interface WorkspaceResponse {
  success: boolean;
  data?: {
    workspaceId: string;
    workspaceName: string;
    workspaceSlug: string;
  };
  error?: {
    message: string;
    code: string;
    source: string;
    details?: unknown;
  };
}

function logMessage(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any) {
  console[level](`[/api/team/init] ${message}`, data || '');
}

export async function POST(request: Request) {
  try {
    const requestBody: RequestBody = await request.json().catch(() => ({}));
    const { workspaceName, workspaceSlug, industry, companySize, subscriptionTier = 'free' } = requestBody;
    
    const headersList = headers();
    const authHeaders = {
      authorization: headersList.get('authorization') || '',
      cookie: headersList.get('cookie') || ''
    };

    // Log high-level header/cookie presence
    try {
      const cookieStore = cookies();
      const cookieNames = cookieStore.getAll().map(c => c.name);
      logMessage('debug', 'Request headers', { authorization: authHeaders.authorization?.slice(0, 20), cookieCount: cookieNames.length });
      logMessage('debug', 'Incoming cookie names', cookieNames);
    } catch (e) {
      logMessage('warn', 'Failed to enumerate cookies', { error: (e as Error).message });
    }

    // Create Supabase client for database operations with service role key
    const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Create Supabase client for auth operations with anon key
    const authClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Try to get user from server cookies first (most reliable)
    let currentUser: User | null = null;
    let authError: Error | null = null;
    try {
      const rhc = createRouteHandlerClient({ cookies });
      const { data: { user } } = await rhc.auth.getUser();
      if (user) {
        currentUser = user;
        logMessage('debug', 'User verified via routeHandler cookies', { id: user.id, email: user.email });
      }
    } catch (e) {
      logMessage('debug', 'routeHandlerClient cookie auth failed', { error: (e as Error).message });
    }

    // Fallback to Bearer token verification
    if (!currentUser && authHeaders.authorization?.startsWith('Bearer ')) {
      const token = authHeaders.authorization.split(' ')[1];
      logMessage('debug', 'Verifying token', { token: token.slice(0, 20) });
      
      try {
        // Verify token with Supabase
        const { data: { user }, error } = await authClient.auth.getUser(token);
        if (error) throw error;
        if (!user) throw new Error('No user found for token');
        
        currentUser = user;
        logMessage('debug', 'User verified', { id: user.id, email: user.email });
      } catch (err) {
        authError = err as Error;
        logMessage('error', 'Token verification failed', { error: err });
      }
    }

    // Dev/test fallback: accept service-role signed JWTs to identify user in non-production
    if (!currentUser && authHeaders.authorization?.startsWith('Bearer ')) {
      try {
        const token = authHeaders.authorization.split(' ')[1];
        if (process.env.NODE_ENV !== 'production' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const decoded: any = jwt.verify(token, process.env.SUPABASE_SERVICE_ROLE_KEY);
          const userId = decoded?.sub;
          const email = decoded?.email || undefined;
          if (userId) {
            currentUser = {
              id: userId,
              aud: 'authenticated',
              email: email,
              app_metadata: {},
              user_metadata: {},
              created_at: new Date().toISOString(),
              phone: '',
              role: 'authenticated',
              updated_at: new Date().toISOString(),
              identities: []
            } as unknown as User;
            logMessage('warn', 'Using dev fallback auth from service-role token', { id: userId, email });
          }
        }
      } catch (e) {
        // ignore fallback failure
        logMessage('debug', 'Dev fallback token verification failed', { error: (e as Error).message });
      }
    }

    // Secondary cookie-based fallback using createServerClient
    if (!currentUser) {
      try {
        const cookieStore = cookies();
        const serverSupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get(name: string) {
                return cookieStore.get(name)?.value;
              },
              set() { /* no-op */ },
              remove() { /* no-op */ }
            }
          }
        );
        const { data: { user } } = await serverSupabase.auth.getUser();
        if (user) {
          currentUser = user;
          logMessage('debug', 'User verified via cookies (server client)', { id: user.id, email: user.email });
        }
      } catch (err) {
        logMessage('error', 'Cookie-based auth failed', { error: err });
      }
    }

    const currentAuthMethod = authHeaders.authorization?.startsWith('Bearer ') ? 'bearer' : 'cookie';

    logMessage('debug', 'Auth result', { method: currentAuthMethod, userId: currentUser?.id });

    if (!currentUser) {
      // When auth fails, include debug about cookie presence and auth header
      const cookieStore = cookies();
      const cookieNames = cookieStore.getAll().map(c => c.name);
      logMessage('warn', 'Auth failed - no currentUser', { cookieNames, hasAuthHeader: Boolean(authHeaders.authorization) });
      const response: WorkspaceResponse = {
        success: false,
        error: {
          message: 'No valid user session found',
          code: 'INVALID_SESSION',
          source: 'auth'
        }
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Ensure a user profile exists for freemium onboarding-less flow
    try {
      const { data: profileList, error: profileFetchErr } = await supabaseClient
        .from('user_profiles')
        .select('id')
        .eq('id', currentUser.id)
        .limit(1);
      if (profileFetchErr) {
        logMessage('warn', 'Profile lookup failed', { error: profileFetchErr });
      }
      const hasProfile = (profileList && profileList.length > 0);
      if (!hasProfile) {
        const displayName = (currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User') as string;
        const { error: profileInsertErr } = await supabaseClient
          .from('user_profiles')
          .insert({
            id: currentUser.id,
            email: currentUser.email,
            name: displayName,
            onboarding_completed: false
          } as any);
        if (profileInsertErr && (profileInsertErr as any).code !== '23505') {
          logMessage('warn', 'Failed to create user profile (non-fatal)', { error: profileInsertErr });
        } else if (!profileInsertErr) {
          logMessage('info', 'Created missing user profile for user', { id: currentUser.id });
        }
      }
    } catch (e) {
      logMessage('warn', 'Unexpected error ensuring profile (non-fatal)', { error: (e as Error).message });
    }

    // Prepare base name and slug
    const baseName = workspaceName || `${currentUser.email}'s Workspace`;
    const baseSlug = (workspaceSlug || baseName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // If slug already exists and is owned by the current user, reuse it and ensure membership
    const { data: existingSlugList, error: existingSlugErr } = await supabaseClient
      .from('workspaces')
      .select('id, owner_id, slug')
      .eq('slug', baseSlug)
      .limit(1);

    if (existingSlugErr) {
      logMessage('warn', 'Slug existence check failed', { error: existingSlugErr });
    }

    const existing = existingSlugList && existingSlugList.length > 0 ? existingSlugList[0] as { id: string; owner_id: string; slug: string } : null;
    if (existing && existing.owner_id === currentUser.id) {
      // Ensure membership exists; ignore duplicate errors
      const { error: memberEnsureErr } = await supabaseClient
        .from('workspace_members')
        .insert({
          workspace_id: existing.id,
          user_id: currentUser.id,
          role: 'owner',
          invitation_status: 'active',
          joined_at: new Date().toISOString()
        });
      if (memberEnsureErr && (memberEnsureErr as any).code !== '23505') {
        logMessage('error', 'Failed to ensure workspace membership', { error: memberEnsureErr });
        return NextResponse.json({
          success: false,
          error: {
            message: 'Failed to create workspace membership',
            code: 'INSERT_ERROR',
            source: 'database',
            details: memberEnsureErr
          }
        }, { status: 500 });
      }
      // Set user's default workspace if not already set
      const { error: defaultWsErrExisting } = await supabaseClient
        .from('user_profiles')
        .update({ default_workspace_id: existing.id })
        .eq('id', currentUser.id)
        .is('default_workspace_id', null);
      if (defaultWsErrExisting) {
        logMessage('warn', 'Failed to set default workspace (existing)', { error: defaultWsErrExisting });
      }
      const response: WorkspaceResponse = {
        success: true,
        data: {
          workspaceId: existing.id,
          workspaceName: baseName,
          workspaceSlug: existing.slug
        }
      };
      return NextResponse.json(response);
    }

    // Attempt to create a workspace, uniquifying slug on conflict
    const randomSuffix = () => Math.random().toString(36).slice(2, 8);
    let attempt = 0;
    let created: { id: string; slug: string } | null = null;
    let usedSlug = baseSlug;
    let lastInsertError: PostgrestError | null = null;

    while (attempt < 5 && !created) {
      const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${randomSuffix()}`;
      const { data: ws, error: insErr } = await supabaseClient
        .from('workspaces')
        .insert({
          name: baseName,
          slug: candidate,
          owner_id: currentUser.id,
          type: 'customer',
          industry,
          company_size: companySize,
          subscription_tier: subscriptionTier
        })
        .select('id, slug')
        .single();

      if (!insErr && ws) {
        created = ws as { id: string; slug: string };
        usedSlug = ws.slug;
        break;
      }

      lastInsertError = insErr as PostgrestError;
      if (insErr && (insErr as any).code === '23505') {
        // Duplicate slug; try again with a suffix
        attempt += 1;
        continue;
      } else {
        logMessage('error', 'Failed to create workspace', { error: insErr });
        return NextResponse.json({
          success: false,
          error: {
            message: 'Failed to create workspace',
            code: 'INSERT_ERROR',
            source: 'database',
            details: insErr
          }
        }, { status: 500 });
      }
    }

    if (!created) {
      logMessage('error', 'Failed to create workspace after multiple attempts', { error: lastInsertError });
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to create workspace',
          code: 'INSERT_ERROR',
          source: 'database',
          details: lastInsertError || 'Unknown error'
        }
      }, { status: 500 });
    }

    // Ensure owner membership (ignore duplicates)
    const { error: memberError } = await supabaseClient
      .from('workspace_members')
      .insert({
        workspace_id: created.id,
        user_id: currentUser.id,
        role: 'owner',
        invitation_status: 'active',
        joined_at: new Date().toISOString()
      });
    if (memberError && (memberError as any).code !== '23505') {
      logMessage('error', 'Failed to create workspace membership', { error: memberError });
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to create workspace membership',
          code: 'INSERT_ERROR',
          source: 'database',
          details: memberError
        }
      }, { status: 500 });
    }

    // Set user's default workspace if not already set
    const { error: defaultWsErr } = await supabaseClient
      .from('user_profiles')
      .update({ default_workspace_id: created.id })
      .eq('id', currentUser.id)
      .is('default_workspace_id', null);
    if (defaultWsErr) {
      logMessage('warn', 'Failed to set default workspace (created)', { error: defaultWsErr });
    }

    const response: WorkspaceResponse = {
      success: true,
      data: {
        workspaceId: created.id,
        workspaceName: baseName,
        workspaceSlug: usedSlug
      }
    };
    return NextResponse.json(response);

  } catch (error: unknown) {
    logMessage('error', 'Unexpected error', { 
      error: error instanceof Error ? error.message : String(error)
    });
    const response: WorkspaceResponse = {
      success: false,
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        source: 'server',
        details: error instanceof Error ? error.message : String(error)
      }
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export const runtime = 'nodejs';
