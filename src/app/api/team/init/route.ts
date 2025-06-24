import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function POST() {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Fetch user workspace for scoping
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('workspace_id')
    .eq('id', session.user.id)
    .single();
  if (userError || !user) {
    console.error('Error fetching user workspace:', userError);
    return NextResponse.json({ error: userError?.message || 'Error fetching user workspace' }, { status: 500 });
  }
  const workspaceId = user.workspace_id;

  // Check if any team members exist for this workspace
  const { count, error: countError } = await supabase
    .from('team_members')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);
  if (countError) {
    console.error('Error checking team members count:', countError);
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (!count || count === 0) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('workspace_id, email')
      .eq('id', session.user.id)
      .single();
    if (userError || !user) {
      console.error('Error fetching user info:', userError);
      return NextResponse.json({ error: userError?.message }, { status: 500 });
    }

    const { error: insertError } = await supabase
      .from('team_members')
      .insert({
        workspace_id: user.workspace_id,
        email: user.email,
        role: 'owner',
        status: 'active',
        invited_at: new Date().toISOString(),
      });
    if (insertError) {
      console.error('Error inserting initial team member:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export const config = { runtime: 'edge' };
