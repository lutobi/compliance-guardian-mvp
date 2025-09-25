/**
 * WORKSPACE MEMBERS API - MULTI-TENANT
 * 
 * Manages workspace team members:
 * - GET: List all members in a workspace
 */

import { NextRequest, NextResponse } from 'next/server';
import { withWorkspaceContext, Permission } from '@/lib/api/request-utils';

/**
 * GET: List all members in a workspace
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  return withWorkspaceContext(
    request,
    Permission.VIEW_TEAM,
    async (context) => {
      console.log(`[API] GET /api/workspaces/${params.workspaceId}/members`);
      
      const { data: members, error } = await context.supabase
        .from('workspace_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles:user_id (
            email,
            first_name,
            last_name
          )
        `)
        .eq('workspace_id', context.workspaceId)
        .order('role', { ascending: true });
      
      if (error) {
        console.error('Error fetching workspace members:', error);
        return { error: 'Failed to fetch workspace members' };
      }
      
      return {
        data: members,
        count: members?.length || 0
      };
    }
  );
}
