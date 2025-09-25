import { NextResponse } from 'next/server';
import { isPlatformAdmin } from '@/lib/auth/admin';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    // Support Authorization header for cases where cookies aren't present
    const authHeader = (request.headers.get('authorization') || request.headers.get('Authorization')) || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : undefined;

    let user = undefined as any;
    let error = null as any;
    if (token) {
      const res = await supabase.auth.getUser(token);
      user = res.data?.user;
      error = res.error;
    } else {
      const res = await supabase.auth.getUser();
      user = res.data?.user;
      error = res.error;
    }
    if (error) {
      return NextResponse.json({ authenticated: false, error: error.message }, { status: 200 });
    }

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Fetch active memberships (no embed), then stitch workspaces
    const { data: rawMemberships, error: membershipsError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('invitation_status', 'active')
      .order('last_accessed_at', { ascending: false, nullsFirst: false });

    let memberships: any[] = [];
    if (!membershipsError && rawMemberships && rawMemberships.length > 0) {
      const workspaceIds = Array.from(new Set(rawMemberships.map(m => m.workspace_id).filter(Boolean)));
      let workspaces: Record<string, any> = {};
      if (workspaceIds.length > 0) {
        const { data: wsData } = await supabase
          .from('workspaces')
          .select('*')
          .in('id', workspaceIds);
        (wsData || []).forEach(w => { workspaces[w.id] = w; });
      }
      memberships = rawMemberships.map(m => ({
        ...m,
        workspace: workspaces[m.workspace_id] || null,
      }));
    }

    // Determine current workspace slug (default or first active)
    let currentWorkspaceSlug: string | null = null;
    const defaultId = profile?.default_workspace_id || null;
    if (defaultId) {
      const def = memberships.find(m => m.workspace_id === defaultId);
      if (def?.workspace?.slug) currentWorkspaceSlug = def.workspace.slug;
    }
    if (!currentWorkspaceSlug && memberships.length > 0) {
      currentWorkspaceSlug = memberships[0]?.workspace?.slug || null;
    }

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, email: user.email },
      profile: profile ? {
        id: profile.id,
        email: profile.email,
        default_workspace_id: profile.default_workspace_id,
        onboarding_completed: profile.onboarding_completed ?? false,
      } : null,
      memberships: memberships.map(m => ({
        workspace_id: m.workspace_id,
        role: m.role,
        invitation_status: m.invitation_status,
        last_accessed_at: m.last_accessed_at,
        workspace: m.workspace ? {
          id: m.workspace.id,
          slug: m.workspace.slug,
          name: m.workspace.name,
        } : null,
      })),
      currentWorkspaceSlug,
      platformAdmin: isPlatformAdmin(user.email),
      adminSources: {
        NEXT_PUBLIC_PLATFORM_ADMINS: (process.env.NEXT_PUBLIC_PLATFORM_ADMINS || '').split(',').map(s => s.trim()).filter(Boolean),
        PLATFORM_ADMINS: (process.env.PLATFORM_ADMINS || '').split(',').map(s => s.trim()).filter(Boolean),
      },
      errors: {
        profileError: profileError ? {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
        } : null,
        membershipsError: membershipsError?.message || null,
      }
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ authenticated: false, error: e?.message || 'unknown' }, { status: 500 });
  }
}
