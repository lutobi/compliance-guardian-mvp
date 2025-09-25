/**
 * BILLING INVOICES API - MULTI-TENANT (MIGRATED TO NEW SECURE PATTERN)
 * 
 * Handles workspace invoice management with workspace context:
 * - GET: Retrieve invoices for current workspace with pagination
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
  return withWorkspaceContext(request, 'view_billing', async (context) => {
    const { user } = context;
    const pagination = extractPaginationParams(request);
    
    console.log(`[API] GET /api/billing/invoices - User: ${user.profile.email}, Workspace: ${user.currentWorkspace?.name}`);

    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);

    const { data, error, count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('workspace_id', user.currentWorkspace!.id)
      .order('created_at', { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (error) {
      console.error('Database error fetching invoices:', error);
      throw new Error(`Failed to fetch invoices: ${error.message}`);
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
