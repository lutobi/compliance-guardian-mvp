import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: list all integrations
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.from('integrations').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

// POST: create a new integration
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { type, config, enabled } = await request.json();
    const { data, error } = await supabase
      .from('integrations')
      .insert({ type, config, enabled })
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add integration' }, { status: 500 });
  }
}

// PUT: update an existing integration
export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { id, updates } = await request.json();
    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing id or updates' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('integrations')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update integration' }, { status: 500 });
  }
}

// DELETE: remove an integration
export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    const { error } = await supabase.from('integrations').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete integration' }, { status: 500 });
  }
}
