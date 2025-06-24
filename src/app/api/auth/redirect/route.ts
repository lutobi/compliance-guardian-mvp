import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log('[Auth Redirect] GET', request.url);
  const url = new URL(request.url);
  const origin = url.origin;
  try {
    // instantiate Supabase client for route handlers
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error: sessErr } = await supabase.auth.getSession();
    const session = data.session;
    console.log('[Auth Redirect] session:', session, 'error:', sessErr);
    
    if (!session) {
      console.log('[Auth Redirect] No session — redirecting to login');
      return NextResponse.redirect(`${origin}/auth/login`);
    }
    
    // Fetch user record
    console.log('[Auth Redirect] fetching user row');
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('id, role_id, workspace_id')
      .eq('id', session.user.id)
      .single();
    if (userErr || !userRow) {
      console.error('[Auth Redirect] userRow error:', userErr);
      return NextResponse.redirect(`${origin}/dashboard`);
    }
    
    // Fetch role details
    console.log('[Auth Redirect] fetching role row for role_id', userRow.role_id);
    const { data: roleRow, error: roleErr } = await supabase
      .from('roles')
      .select('id, name, capabilities')
      .eq('id', userRow.role_id)
      .single();
    if (roleErr || !roleRow) {
      console.error('[Auth Redirect] roleRow error:', roleErr);
      return NextResponse.redirect(`${origin}/dashboard`);
    }
    
    // Determine user type
    let userType: string | null = roleRow.capabilities?.type || null;
    console.log('[Auth Redirect] userType from role:', userType);
    // Fallback based on role name if needed
    if (!userType) {
      const rn = roleRow.name.toLowerCase();
      if (rn.includes('system')) userType = 'system';
      else if (rn.includes('customer')) userType = 'customer';
    }
    
    console.log('[Auth Redirect] redirect target based on userType');
    // Redirect based on user type
    if (userType === 'system') {
      return NextResponse.redirect(`${origin}/dashboard`);
    } else if (userType === 'customer') {
      // Check if user has a workspace
      if (userRow.workspace_id) {
        // Check if this workspace is linked to a customer
        const { data: customerData } = await supabase
          .from('customers')
          .select('id')
          .eq('workspace_id', userRow.workspace_id)
          .single();
        
        if (customerData) {
          return NextResponse.redirect(`${origin}/customer/dashboard`);
        }
      }
      
      // No workspace or no customer, redirect to workspace selection
      return NextResponse.redirect(`${origin}/customer/select-workspace`);
    }
    
    // Default case: redirect to generic dashboard
    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (error) {
    console.error('Error in auth redirect:', error);
    return NextResponse.redirect(`${origin}/dashboard`);
  }
}