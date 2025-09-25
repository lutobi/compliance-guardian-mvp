/**
 * WORKSPACE DETAILS API - MULTI-TENANT
 * 
 * Manages individual workspace settings:
 * - GET: Fetch workspace details
 * - PATCH: Update workspace details
 */

import { NextRequest, NextResponse } from 'next/server';
import { withWorkspaceContext, Permission } from '@/lib/api/request-utils';

/**
 * GET: Fetch workspace details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  return withWorkspaceContext(
    request,
    Permission.VIEW_WORKSPACE,
    async (context) => {
      console.log(`[API] GET /api/workspaces/${params.workspaceId}`);
      
      const { data: workspace, error } = await context.supabase
        .from('workspaces')
        .select('*')
        .eq('id', context.workspaceId)
        .single();
      
      if (error) {
        console.error('Error fetching workspace details:', error);
        return { error: 'Failed to fetch workspace details', status: 500 };
      }
      
      if (!workspace) {
        return { error: 'Workspace not found', status: 404 };
      }
      
      return { data: workspace };
    }
  );
}

/**
 * PATCH: Update workspace details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  return withWorkspaceContext(
    request,
    Permission.MANAGE_WORKSPACE,
    async (context) => {
      console.log(`[API] PATCH /api/workspaces/${params.workspaceId}`);
      
      try {
        const body = await context.requestBody;
        
        // Fields that can be updated
        const allowedFields = ['name', 'industry', 'description', 'logo_url'];
        const updateData: Record<string, any> = {};
        
        // Filter allowed fields
        Object.keys(body).forEach(key => {
          if (allowedFields.includes(key)) {
            updateData[key] = body[key];
          }
        });
        
        // Validate required fields
        if (!updateData.name || updateData.name.trim() === '') {
          return { error: 'Workspace name cannot be empty', status: 400 };
        }
        
        // Update workspace
        const { data: workspace, error: updateError } = await context.supabase
          .from('workspaces')
          .update(updateData)
          .eq('id', context.workspaceId)
          .select()
          .single();
        
        if (updateError) {
          console.error('Error updating workspace:', updateError);
          return { error: 'Failed to update workspace details', status: 500 };
        }
        
        return {
          data: workspace,
          message: 'Workspace updated successfully'
        };
        
      } catch (error) {
        console.error('Error processing workspace update:', error);
        return { error: 'Failed to process workspace update', status: 500 };
      }
    }
  );
}
