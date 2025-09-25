/**
 * SUBSCRIPTION TIERS API
 * 
 * Provides access to available subscription tier information:
 * - GET: List all available subscription tiers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractUser } from '@/lib/api/request-utils';

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await extractUser(request);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[API] GET /api/subscription-tiers - User: ${user.profile.email}`);
    
    // Use standard Supabase client (not workspace-scoped)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Fetch all active subscription tiers
    const { data: tiers, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('is_active', true)
      .order('monthly_price', { ascending: true });
    
    if (error) {
      console.error('Error fetching subscription tiers:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch subscription tiers' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return NextResponse.json({
      data: tiers,
      count: tiers?.length || 0
    });
    
  } catch (error: any) {
    console.error('Subscription tiers error:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
