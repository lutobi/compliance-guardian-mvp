import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Test-only seeding endpoint. Do NOT enable in production.
// Guards:
// - Disabled in production
// - Requires X-Seed-Token header matching TEST_SEED_TOKEN (or 'dev-seed' default)

type SeedBody = {
  email: string;
  password?: string;
  workspaceSlug?: string | null;
  workspaceName?: string | null;
};

function deriveSlug(email: string) {
  const local = email.replace(/@[^@]+$/, '');
  const base = local.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const suffix = Math.random().toString(36).slice(2, 10);
  return `${base}-${suffix}`;
}

async function findUserByEmail(admin: any, email: string) {
  const perPage = 100;
  let page = 1;
  while (true) {
    const { data, error } = await (admin as any).auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users || [];
    const found = users.find((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (users.length < perPage) return null;
    page += 1;
  }
}

export async function POST(request: Request) {
  console.log('Seed API called');
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 });
    }

    const seedToken = request.headers.get('x-seed-token') || '';
    const expected = process.env.TEST_SEED_TOKEN || 'dev-seed';
    if (seedToken !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      console.error('Missing env vars:', { supabaseUrl: !!supabaseUrl, serviceKey: !!serviceKey });
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const body = (await request.json()) as SeedBody;
    if (!body?.email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }
    const email = body.email;
    const password = body.password || 'Password123!';

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Create or find user
    let user = await findUserByEmail(admin, email);
    if (!user) {
      const { data, error } = await (admin as any).auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: 'E2E Test User' },
      });
      if (error) {
        // Fallback: if already exists, try to find again
        user = await findUserByEmail(admin, email);
        if (!user) throw error;
      } else {
        user = data.user;
      }
    } else {
      // Ensure confirmed and set password
      const { data, error } = await (admin as any).auth.admin.updateUserById(user.id, {
        email_confirm: true,
        password,
      });
      if (!error) user = data.user || user;
    }

    if (!user?.id) {
      return NextResponse.json({ error: 'Failed to obtain user id' }, { status: 500 });
    }

    // Prepare workspace
    const slug = body.workspaceSlug || deriveSlug(email);
    const name = body.workspaceName || `${email.split('@')[0]}'s Workspace`;

    // Upsert user profile (align with schema: id, email, name, timestamps)
    const { error: profErr } = await admin.from('user_profiles').upsert(
      {
        id: user.id,
        email,
        name: email.split('@')[0],
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (profErr) return NextResponse.json({ error: `Upsert profile failed: ${profErr.message}` }, { status: 500 });

    // Create a new workspace with owner via RPC to avoid schema cache issues
    // Always use a fresh slug by default to prevent unique conflicts
    const { data: createdWsId, error: createWsErr } = await (admin as any).rpc('create_workspace_with_owner', {
      p_user_id: user.id,
      p_workspace_name: name,
      p_workspace_slug: slug,
      p_industry: null,
      p_company_size: null,
    });
    if (createWsErr) {
      return NextResponse.json({ error: `Failed to create workspace via RPC: ${createWsErr.message}` }, { status: 500 });
    }
    const workspaceId = createdWsId as string;

    // Membership and owner are handled inside create_workspace_with_owner

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email },
      workspace: { id: workspaceId, slug, name },
    });
  } catch (err: any) {
    console.error('Seed API error:', err);
    return NextResponse.json({ 
      error: err?.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'production' ? undefined : err?.stack
    }, { status: 500 });
  }
}
