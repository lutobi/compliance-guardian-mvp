/**
 * INTEGRATIONS API - MULTI-TENANT (MIGRATED TO NEW SECURE PATTERN)
 * 
 * Handles external system integrations with workspace context:
 * - GET: List integrations in current workspace with pagination
 * - POST: Create new integration in workspace
 * - PUT: Update existing integration
 * - DELETE: Remove integration from workspace
 */

import { NextRequest } from 'next/server';
import { 
  withWorkspaceContext, 
  extractPaginationParams, 
  createPaginatedResponse,
  getWorkspaceScopedClient,
  getWorkspaceMetadata 
} from '@/lib/api/request-utils';

export async function GET(request: NextRequest) {
  return withWorkspaceContext(request, 'view_integrations', async (context) => {
    const { user } = context;
    const pagination = extractPaginationParams(request);
    
    console.log(`[API] GET /api/integrations - User: ${user.profile.email}, Workspace: ${user.currentWorkspace?.name}`);

    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);

    const { data, error, count } = await supabase
      .from('integrations')
      .select('*', { count: 'exact' })
      .eq('workspace_id', user.currentWorkspace!.id)
      .order('created_at', { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (error) {
      console.error('Database error fetching integrations:', error);
      throw new Error(`Failed to fetch integrations: ${error.message}`);
    }

    // Return paginated response with workspace metadata
    return createPaginatedResponse(
      data || [],
      count || 0,
      pagination,
      {
        workspace: getWorkspaceMetadata(user)
      }
    );
  });
}

export async function POST(request: NextRequest) {
  return withWorkspaceContext(request, 'manage_integrations', async (context) => {
    const { user, body } = context;
    
    console.log(`[API] POST /api/integrations - User: ${user.profile.email}, Workspace: ${user.currentWorkspace?.name}`);
    
    // Validation
    const { type, config, enabled } = body;
    if (!type || !config) {
      throw new Error('Integration type and config are required');
    }

    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);
    
    // Create integration record
    const integrationData = {
      type,
      config,
      enabled: enabled ?? true,
      workspace_id: user.currentWorkspace!.id,
      user_id: user.profile.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('integrations')
      .insert(integrationData)
      .select('*')
      .single();

    if (error) {
      console.error('Database error creating integration:', error);
      throw new Error(`Failed to create integration: ${error.message}`);
    }

    return {
      success: true,
      data: { integration: data },
      workspace: getWorkspaceMetadata(user)
    };
  });
}

export async function PUT(request: NextRequest) {
  return withWorkspaceContext(request, 'manage_integrations', async (context) => {
    const { user, body } = context;
    
    const { id, updates } = body;
    if (!id || !updates) {
      throw new Error('Integration ID and updates are required');
    }
    
    console.log(`[API] PUT /api/integrations - User: ${user.profile.email}, Integration: ${id}`);

    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);
    
    // Verify integration belongs to workspace
    const { data: existingIntegration, error: fetchError } = await supabase
      .from('integrations')
      .select('id, workspace_id')
      .eq('id', id)
      .eq('workspace_id', user.currentWorkspace!.id)
      .single();

    if (fetchError || !existingIntegration) {
      throw new Error('Integration not found');
    }

    // Update integration
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('integrations')
      .update(updateData)
      .eq('id', id)
      .eq('workspace_id', user.currentWorkspace!.id)
      .select('*')
      .single();

    if (error) {
      console.error('Database error updating integration:', error);
      throw new Error(`Failed to update integration: ${error.message}`);
    }

    return {
      success: true,
      data: { integration: data },
      workspace: getWorkspaceMetadata(user)
    };
  });
}

export async function DELETE(request: NextRequest) {
  return withWorkspaceContext(request, 'manage_integrations', async (context) => {
    const { user, body } = context;
    
    const { id } = body;
    if (!id) {
      throw new Error('Integration ID is required');
    }
    
    console.log(`[API] DELETE /api/integrations - User: ${user.profile.email}, Integration: ${id}`);

    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);
    
    // Verify integration belongs to workspace
    const { data: existingIntegration, error: fetchError } = await supabase
      .from('integrations')
      .select('id, workspace_id')
      .eq('id', id)
      .eq('workspace_id', user.currentWorkspace!.id)
      .single();

    if (fetchError || !existingIntegration) {
      throw new Error('Integration not found');
    }

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id)
      .eq('workspace_id', user.currentWorkspace!.id);

    if (error) {
      console.error('Database error deleting integration:', error);
      throw new Error(`Failed to delete integration: ${error.message}`);
    }

    return {
      success: true,
      data: { 
        id,
        message: 'Integration deleted successfully'
      },
      workspace: getWorkspaceMetadata(user)
    };
  });
}
