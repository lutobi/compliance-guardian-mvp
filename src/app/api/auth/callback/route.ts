import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Force dynamic so route is always executed (not cached)
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/callback
 * Receives auth state changes from the client and sets / clears Supabase
 * cookies for the server-side environment. This enables API routes and
 * middleware to access the current session (e.g. /api/team/init).
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;
  
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);
    
    if (session?.user) {
      // First check if user has completed onboarding
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single();

      // If onboarding not completed, direct to onboarding flow
      if (!profile || !profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      // Check if user has any workspaces
      const { data: memberships } = await supabase
        .from('workspace_members')
        .select('workspace_id, workspace:workspaces(slug)')
        .eq('user_id', session.user.id)
        .limit(1);
      
      if (memberships && memberships.length > 0 && memberships[0].workspace?.slug) {
        // Redirect to the first workspace's dashboard using slug (not ID)
        return NextResponse.redirect(`${origin}/workspace/${memberships[0].workspace.slug}/dashboard`);
      } else {
        // If has memberships but can't get slug, go to workspace selection
        return NextResponse.redirect(`${origin}/workspace/select`);
      }
    }
  }

  // Default redirect for new users or if no workspaces found
  return NextResponse.redirect(`${origin}/onboarding`);
}

export async function POST(request: Request) {
  try {
    const { event, session } = await request.json();
    console.log('[auth-callback] event', event);
    console.log('[auth-callback] access?', session?.access_token?.slice(0, 20));
    console.log('[auth-callback] refresh?', session?.refresh_token?.slice(0, 20));

    // Initialise a server-side Supabase client bound to the same cookie jar
    const supabase = createRouteHandlerClient({ cookies });

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session?.access_token && session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }
    }

    if (event === 'SIGNED_OUT') {
      await supabase.auth.signOut();
    }

    // Manually propagate cookies, keeping the last non-empty value for each name
    const cookieStore = cookies();
    const res = NextResponse.json({ success: true });
    const seen = new Set<string>();
    const all = cookieStore.getAll();
    for (let i = all.length - 1; i >= 0; i--) {
      const { name, value } = all[i];
      if (!value || seen.has(name)) continue;
      seen.add(name);
      res.cookies.set(name, value, { path: '/' });
    }
    return res;
  } catch (error) {
    console.error('Error in auth callback route', error);
    return NextResponse.json({ success: false, error: 'Failed to handle auth callback' }, { status: 500 });
  }
}
