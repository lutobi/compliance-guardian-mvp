/**
 * INVITATION ACCEPTANCE API
 * 
 * Handles workspace invitation acceptance:
 * - POST: Accept a workspace invitation using token
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractUser } from '@/lib/api/request-utils';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await extractUser(request);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[API] POST /api/invitations/accept - User: ${user.profile.email}`);
    
    // Parse request body
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Invitation token is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Use standard Supabase client (not workspace-scoped)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Begin transaction to process invitation
    const { data, error } = await supabase.rpc('accept_workspace_invitation', {
      invitation_token: token,
      accepting_user_id: user.id,
      accepting_user_email: user.profile.email
    });
    
    if (error) {
      console.error('Error accepting invitation:', error);
      
      // Provide more specific error messages for common issues
      if (error.message.includes('expired')) {
        return new NextResponse(
          JSON.stringify({ error: 'This invitation has expired' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      } else if (error.message.includes('not found')) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid invitation token' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      } else if (error.message.includes('already a member')) {
        return new NextResponse(
          JSON.stringify({ error: 'You are already a member of this workspace' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return new NextResponse(
        JSON.stringify({ error: 'Failed to accept invitation' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return NextResponse.json({
      data: data,
      message: 'Invitation accepted successfully'
    });
    
  } catch (error: any) {
    console.error('Invitation acceptance error:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
