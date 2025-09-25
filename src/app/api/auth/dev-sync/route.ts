import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json();
    if (!access_token || !refresh_token) {
      return NextResponse.json({ success: false, error: 'Missing tokens' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.setSession({ access_token, refresh_token });
    // Cookies are set via the Next.js cookies API by the Supabase helper
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[dev-sync] error', e);
    return NextResponse.json({ success: false, error: 'Failed to sync' }, { status: 500 });
  }
}
