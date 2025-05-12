import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('id');

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select(`
      *,
      customers (
        id,
        name,
        industry,
        settings
      ),
      users (
        id,
        name,
        email,
        roles (
          id,
          name,
          capabilities
        )
      )
    `)
    .eq('id', workspaceId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(workspace);
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const json = await request.json();

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .insert(json)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(workspace);
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const json = await request.json();
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('id');

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .update(json)
    .eq('id', workspaceId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(workspace);
}
