import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET subscription
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.from('subscriptions').select('*').maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

// PUT subscription
export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { subscription_plan } = await request.json();
    if (!subscription_plan) {
      return NextResponse.json({ error: 'Missing subscription plan' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({ subscription_plan }, { onConflict: 'workspace_id' })
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update subscription' }, { status: 500 });
  }
}
