/**
 * WORKSPACE API - MULTI-TENANT (STANDARDIZED)
 * 
 * Manages workspace data with secure multi-tenant context:
 * - GET: Retrieve workspace details
 * - POST: Create a new workspace
 * - PUT: Update an existing workspace
 */

import { NextRequest } from 'next/server';
import { 
  withWorkspaceContext, 
  getWorkspaceScopedClient,
  getWorkspaceMetadata
} from '@/lib/api/request-utils';

export async function GET(request: NextRequest) {
  return withWorkspaceContext(request, 'view_settings', async (context) => {
    const { user, workspaceContext } = context;
    const supabase = getWorkspaceScopedClient(workspaceContext.slug);
    
    console.log(`[API] GET /api/workspace - User: ${user.profile.email}, Workspace: ${workspaceContext.slug}`);
    
    // Get workspace details with related data
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select(`
        *,
        customers (
          id,
          name,
          industry,
          settings
        ),
        users (
          id,
          name,
          email,
          roles (
            id,
            name,
            capabilities
          )
        )
      `)
      .eq('slug', workspaceContext.slug)
      .single();

    if (error) {
      throw new Error(`Failed to retrieve workspace: ${error.message}`);
    }
    
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    return {
      workspace,
      metadata: getWorkspaceMetadata(user)
    };
  });
}

export async function POST(request: NextRequest) {
  return withWorkspaceContext(request, 'manage_settings', async (context) => {
    const { user, body } = context;
    
    if (!body) {
      throw new Error('Request body is required');
    }
    
    // Validate required workspace fields
    if (!body.name || !body.slug) {
      throw new Error('Workspace name and slug are required');
    }
    
    console.log(`[API] POST /api/workspace - User: ${user.profile.email}, Creating workspace: ${body.slug}`);
    
    const supabase = getWorkspaceScopedClient(user.currentWorkspace?.slug || '');
    
    // First check if slug is already taken
    const { data: existingWorkspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('slug', body.slug)
      .single();
      
    if (existingWorkspace) {
      throw new Error('Workspace slug already exists');
    }
    
    // Create the workspace
    const workspaceData = {
      ...body,
      owner_id: user.profile.id,
      created_at: new Date().toISOString()
    };
    
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert(workspaceData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create workspace: ${error.message}`);
    }

    // Add the user as a workspace admin
    const { error: membershipError } = await supabase
      .from('workspace_members')
      .insert({
        user_id: user.profile.id,
        workspace_id: workspace.id,
        role: 'admin',
        joined_at: new Date().toISOString()
      });
      
    if (membershipError) {
      throw new Error(`Failed to add admin to workspace: ${membershipError.message}`);
    }

    return {
      workspace,
      message: 'Workspace created successfully',
      user: {
        id: user.profile.id,
        email: user.profile.email
      }
    };
  });
}

export async function PUT(request: NextRequest) {
  return withWorkspaceContext(request, 'manage_settings', async (context) => {
    const { user, body, workspaceContext } = context;
    
    if (!body) {
      throw new Error('Request body is required');
    }
    
    console.log(`[API] PUT /api/workspace - User: ${user.profile.email}, Updating workspace: ${workspaceContext.slug}`);
    
    // Protect critical fields from being modified
    const safeUpdateData = { ...body };
    delete safeUpdateData.id;
    delete safeUpdateData.slug;
    delete safeUpdateData.owner_id;
    delete safeUpdateData.created_at;
    
    const supabase = getWorkspaceScopedClient(workspaceContext.slug);
    
    // Verify workspace exists and user has admin access
    const { data: existingWorkspace } = await supabase
      .from('workspaces')
      .select('id, owner_id')
      .eq('slug', workspaceContext.slug)
      .single();
    
    if (!existingWorkspace) {
      throw new Error('Workspace not found');
    }
    
    // Only workspace owner can update certain fields
    if (body.settings && existingWorkspace.owner_id !== user.profile.id) {
      throw new Error('Only the workspace owner can update settings');
    }
    
    // Update the workspace
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .update({
        ...safeUpdateData,
        updated_at: new Date().toISOString()
      })
      .eq('slug', workspaceContext.slug)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update workspace: ${error.message}`);
    }

    return {
      workspace,
      message: 'Workspace updated successfully',
      metadata: getWorkspaceMetadata(user)
    };
  });
}
