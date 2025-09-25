/**
 * WORKSPACE MEMBER API - MULTI-TENANT
 * 
 * Manages individual workspace team members:
 * - PATCH: Update a member's role
 * - DELETE: Remove a member from workspace
 */

import { NextRequest, NextResponse } from 'next/server';
import { withWorkspaceContext, Permission } from '@/lib/api/request-utils';

/**
 * PATCH: Update a member's role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { workspaceId: string; memberId: string } }
) {
  return withWorkspaceContext(
    request,
    Permission.MANAGE_TEAM,
    async (context) => {
      console.log(`[API] PATCH /api/workspaces/${params.workspaceId}/members/${params.memberId}`);
      
      try {
        const body = await context.requestBody;
        const { role } = body;
        
        if (!role) {
          return { error: 'Role is required', status: 400 };
        }
        
        // Validate role
        const validRoles = ['admin', 'member'];
        if (!validRoles.includes(role)) {
          return { error: 'Invalid role specified', status: 400 };
        }
        
        // Check if the member exists and belongs to this workspace
        const { data: member } = await context.supabase
          .from('workspace_members')
          .select('id, role')
          .eq('id', params.memberId)
          .eq('workspace_id', context.workspaceId)
          .maybeSingle();
        
        if (!member) {
          return { error: 'Member not found', status: 404 };
        }
        
        // Prevent changing owner's role
        if (member.role === 'owner') {
          return { error: 'Cannot change owner\'s role', status: 403 };
        }
        
        // Update the member's role
        const { error: updateError } = await context.supabase
          .from('workspace_members')
          .update({ role })
          .eq('id', params.memberId)
          .eq('workspace_id', context.workspaceId);
        
        if (updateError) {
          console.error('Error updating member role:', updateError);
          return { error: 'Failed to update member role', status: 500 };
        }
        
        return {
          message: 'Member role updated successfully'
        };
        
      } catch (error) {
        console.error('Error processing role update:', error);
        return { error: 'Failed to process role update', status: 500 };
      }
    }
  );
}

/**
 * DELETE: Remove a member from workspace
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { workspaceId: string; memberId: string } }
) {
  return withWorkspaceContext(
    request,
    Permission.MANAGE_TEAM,
    async (context) => {
      console.log(`[API] DELETE /api/workspaces/${params.workspaceId}/members/${params.memberId}`);
      
      try {
        // Check if the member exists and belongs to this workspace
        const { data: member } = await context.supabase
          .from('workspace_members')
          .select('id, role, user_id')
          .eq('id', params.memberId)
          .eq('workspace_id', context.workspaceId)
          .maybeSingle();
        
        if (!member) {
          return { error: 'Member not found', status: 404 };
        }
        
        // Prevent removing the workspace owner
        if (member.role === 'owner') {
          return { error: 'Cannot remove workspace owner', status: 403 };
        }
        
        // Prevent removing yourself
        if (member.user_id === context.user.id) {
          return { error: 'Cannot remove yourself from the workspace', status: 403 };
        }
        
        // Remove the member
        const { error: deleteError } = await context.supabase
          .from('workspace_members')
          .delete()
          .eq('id', params.memberId)
          .eq('workspace_id', context.workspaceId);
        
        if (deleteError) {
          console.error('Error removing member:', deleteError);
          return { error: 'Failed to remove member', status: 500 };
        }
        
        return {
          message: 'Member removed successfully'
        };
        
      } catch (error) {
        console.error('Error processing member removal:', error);
        return { error: 'Failed to process member removal', status: 500 };
      }
    }
  );
}
