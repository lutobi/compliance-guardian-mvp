import { NextResponse } from 'next/server';
import { getAuthenticatedUser, MultiTenantAuthService } from '@/lib/auth/multi-tenant-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 });
  }

  try {
    const { name, slug, industry, companySize } = await request.json();
    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
    }

    const user = await getAuthenticatedUser();
    if (!user?.profile?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const auth = new MultiTenantAuthService();
    const wsId = await auth.createWorkspace(user.profile.id, name, slug, industry, companySize);
    if (!wsId) {
      return NextResponse.json({ error: 'Failed to create workspace' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, workspaceId: wsId, slug });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}
