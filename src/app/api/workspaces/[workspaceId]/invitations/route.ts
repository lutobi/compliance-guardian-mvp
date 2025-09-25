/**
 * WORKSPACE INVITATIONS API - MULTI-TENANT
 * 
 * Handles team member invitations within a workspace:
 * - GET: List all pending invitations for a workspace
 * - POST: Create new invitation for a workspace
 * - DELETE: Cancel an invitation
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { withWorkspaceContext, Permission } from '@/lib/api/request-utils';
import { createClient } from '@supabase/supabase-js';

/**
 * Generate a secure random token for invitations
 */
function generateInvitationToken(): string {
  return uuidv4() + '-' + Date.now().toString(36);
}

/**
 * GET: List all invitations for a workspace
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  return withWorkspaceContext(
    request,
    Permission.MANAGE_TEAM,
    async (context) => {
      console.log(`[API] GET /api/workspaces/${params.workspaceId}/invitations`);
      
      const { data: invitations, error } = await context.supabase
        .from('workspace_invitations')
        .select(`
          id,
          email,
          role,
          status,
          expires_at,
          created_at,
          invited_by,
          profiles:invited_by (email, first_name, last_name)
        `)
        .eq('workspace_id', context.workspaceId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching invitations:', error);
        return { error: 'Failed to fetch invitations' };
      }
      
      return {
        data: invitations,
        count: invitations?.length || 0
      };
    }
  );
}

/**
 * POST: Create a new invitation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  return withWorkspaceContext(
    request,
    Permission.MANAGE_TEAM,
    async (context) => {
      console.log(`[API] POST /api/workspaces/${params.workspaceId}/invitations`);
      
      try {
        const body = await context.requestBody;
        const { email, role = 'member' } = body;
        
        if (!email || !email.includes('@')) {
          return { error: 'Valid email address is required', status: 400 };
        }
        
        // Validate role
        const validRoles = ['member', 'admin'];
        if (!validRoles.includes(role)) {
          return { error: 'Invalid role specified', status: 400 };
        }
        
        // Check if email already exists as a workspace member
        const { data: existingMember } = await context.supabase
          .from('workspace_members')
          .select('id')
          .eq('workspace_id', context.workspaceId)
          .eq('user_id', 'auth.users.id')
          .filter('auth.users.email', 'eq', email)
          .maybeSingle();
        
        if (existingMember) {
          return { error: 'User is already a member of this workspace', status: 400 };
        }
        
        // Check for existing invitation
        const { data: existingInvitation } = await context.supabase
          .from('workspace_invitations')
          .select('id, status')
          .eq('workspace_id', context.workspaceId)
          .eq('email', email)
          .maybeSingle();
        
        if (existingInvitation && existingInvitation.status === 'pending') {
          return { error: 'An invitation for this email is already pending', status: 400 };
        }
        
        // Check subscription limits
        const { data: subscriptionData } = await context.supabase
          .from('workspace_subscriptions')
          .select(`
            subscription_tiers:tier_id (
              max_team_members
            )
          `)
          .eq('workspace_id', context.workspaceId)
          .single();
          
        const maxMembers = subscriptionData?.subscription_tiers?.max_team_members || 1;
        
        // Count current members
        const { count: currentMemberCount } = await context.supabase
          .from('workspace_members')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', context.workspaceId);
        
        // Count pending invitations
        const { count: pendingInvitationCount } = await context.supabase
          .from('workspace_invitations')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', context.workspaceId)
          .eq('status', 'pending');
        
        const totalPotentialMembers = (currentMemberCount || 0) + (pendingInvitationCount || 0);
        
        if (totalPotentialMembers >= maxMembers) {
          return { 
            error: 'Team member limit reached for your subscription tier', 
            status: 403 
          };
        }
        
        // Create invitation token
        const token = generateInvitationToken();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7); // 7 day expiry
        
        // Create invitation
        const { data: invitation, error: inviteError } = await context.supabase
          .from('workspace_invitations')
          .insert({
            workspace_id: context.workspaceId,
            email,
            role,
            invited_by: context.user.id,
            token,
            expires_at: expiryDate.toISOString(),
            status: 'pending'
          })
          .select('id, email, role, expires_at')
          .single();
        
        if (inviteError) {
          console.error('Error creating invitation:', inviteError);
          return { error: 'Failed to create invitation', status: 500 };
        }
        
        // Log the invitation event
        await context.supabase
          .from('invitation_events')
          .insert({
            invitation_id: invitation.id,
            event_type: 'invitation_created',
            actor_id: context.user.id,
            metadata: {
              email,
              role,
              workspace_id: context.workspaceId
            }
          });
        
        // TODO: Send invitation email
        // This would typically be done with an email service or serverless function
        
        return {
          data: invitation,
          message: 'Invitation sent successfully'
        };
      } catch (error) {
        console.error('Error processing invitation request:', error);
        return { error: 'Failed to process invitation', status: 500 };
      }
    }
  );
}

/**
 * DELETE: Cancel an invitation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  return withWorkspaceContext(
    request,
    Permission.MANAGE_TEAM,
    async (context) => {
      console.log(`[API] DELETE /api/workspaces/${params.workspaceId}/invitations`);
      
      try {
        const body = await context.requestBody;
        const { invitationId } = body;
        
        if (!invitationId) {
          return { error: 'Invitation ID is required', status: 400 };
        }
        
        // Check if invitation exists and belongs to this workspace
        const { data: invitation } = await context.supabase
          .from('workspace_invitations')
          .select('id')
          .eq('id', invitationId)
          .eq('workspace_id', context.workspaceId)
          .maybeSingle();
        
        if (!invitation) {
          return { error: 'Invitation not found', status: 404 };
        }
        
        // Delete invitation
        const { error: deleteError } = await context.supabase
          .from('workspace_invitations')
          .delete()
          .eq('id', invitationId);
        
        if (deleteError) {
          console.error('Error deleting invitation:', deleteError);
          return { error: 'Failed to delete invitation', status: 500 };
        }
        
        // Log the cancellation event
        await context.supabase
          .from('invitation_events')
          .insert({
            invitation_id: invitationId,
            event_type: 'invitation_cancelled',
            actor_id: context.user.id,
            metadata: {
              workspace_id: context.workspaceId
            }
          });
        
        return {
          message: 'Invitation cancelled successfully'
        };
      } catch (error) {
        console.error('Error processing cancellation request:', error);
        return { error: 'Failed to process cancellation', status: 500 };
      }
    }
  );
}
