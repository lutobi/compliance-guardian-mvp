import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const frameworkId = searchParams.get('frameworkId');
  if (!frameworkId) {
    return NextResponse.json({ error: 'Missing frameworkId' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data, error } = await supabase
      .from('monitoring')
      .select('*')
      .eq('framework_id', frameworkId)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching monitoring:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch monitoring' },
      { status: 500 }
    );
  }
}
