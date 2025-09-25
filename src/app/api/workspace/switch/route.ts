import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { MultiTenantAuthService, getAuthenticatedUser } from '@/lib/auth/multi-tenant-auth';
import { invalidateSession } from '@/lib/auth/session-cache';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Get request body
    const { workspaceSlug } = await request.json();
    
    if (!workspaceSlug) {
      return NextResponse.json(
        { error: 'Workspace slug is required' },
        { status: 400 }
      );
    }
    
    // Prefer Authorization header via MultiTenantAuthService
    const authUser = await getAuthenticatedUser();
    if (!authUser?.profile?.id) {
      // Fallback: try cookie-based session one last time
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }
    }
    
    // Use the MultiTenantAuthService to switch workspace
    const authService = new MultiTenantAuthService();
    const userId = authUser?.profile?.id as string;
    const success = await authService.switchWorkspace(userId, workspaceSlug);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to switch workspace' },
        { status: 400 }
      );
    }

    // Invalidate server-side session cache for this user to avoid stale middleware reads
    try {
      invalidateSession(userId);
    } catch (e) {
      // Non-fatal; log and continue
      console.warn('Failed to invalidate session cache after workspace switch', e);
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error in workspace switch API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
