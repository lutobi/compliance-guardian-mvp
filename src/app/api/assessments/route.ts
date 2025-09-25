/**
 * ASSESSMENTS API - MULTI-TENANT (ENHANCED)
 * 
 * Handles assessment management with workspace context:
 * - GET: List assessments for current workspace with pagination
 * - POST: Create new assessment in current workspace  
 * - DELETE: Delete assessment (owner/admin only or creator)
 */

import { NextRequest } from 'next/server';
import { 
  withWorkspaceContext, 
  getWorkspaceScopedClient, 
  getWorkspaceMetadata,
  extractPaginationParams,
  createPaginatedResponse,
  checkResourceOwnership
} from '@/lib/api/request-utils';

/**
 * GET /api/assessments
 * Fetch assessments from current workspace with pagination
 */
export async function GET(request: NextRequest) {
  return withWorkspaceContext(request, 'view_assessments', async (context) => {
    const { user } = context;
    const pagination = extractPaginationParams(request);
    
    console.log(`[API] GET /api/assessments - User: ${user.profile.email}, Workspace: ${user.currentWorkspace?.name}`);
    
    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);
    
    // Query assessments with pagination
    const { data: assessments, error, count } = await supabase
      .from('assessments')
      .select(`
        *,
        user_profiles!assessments_user_id_fkey(name, email)
      `, { count: 'exact' })
      .eq('workspace_id', user.currentWorkspace!.id)
      .order('created_at', { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);
    
    if (error) {
      console.error('Database error fetching assessments:', error);
      throw new Error(`Failed to fetch assessments: ${error.message}`);
    }

    // Return paginated response with workspace metadata
    return createPaginatedResponse(
      assessments || [],
      count || 0,
      pagination,
      {
        workspace: getWorkspaceMetadata(user)
      }
    );
  });
}

/**
 * POST /api/assessments
 * Create new assessment in current workspace
 */
export async function POST(request: NextRequest) {
  return withWorkspaceContext(request, 'create_assessments', async (context) => {
    const { user, body } = context;
    
    // Validate required fields
    const { title, framework_id, control_id, status = 'in_progress' } = body || {};
    
    if (!title || !framework_id) {
      throw new Error('Title and framework_id are required');
    }
    
    console.log(`[API] POST /api/assessments - User: ${user.profile.email}, Framework: ${framework_id}`);
    
    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);
    
    // Create assessment data
    const assessmentData = {
      workspace_id: user.currentWorkspace!.id,
      user_id: user.profile.id,
      title,
      framework_id,
      control_id,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert assessment
    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert(assessmentData)
      .select('*')
      .single();
    
    if (error) {
      console.error('Database error creating assessment:', error);
      throw new Error(`Failed to create assessment: ${error.message}`);
    }

    // Assign all controls of the selected framework to this assessment (server-side to satisfy RLS)
    const { data: ctrlRows, error: ctrlError } = await supabase
      .from('controls')
      .select('id')
      .eq('framework_id', framework_id as string);
    if (ctrlError) {
      console.error('Database error fetching controls for assignment:', ctrlError);
      throw new Error(`Failed to fetch controls for framework: ${ctrlError.message}`);
    }
    if (ctrlRows && ctrlRows.length > 0) {
      const acRows = ctrlRows.map((c: { id: string }) => ({ assessment_id: assessment.id, control_id: c.id }));
      const { error: acError } = await supabase
        .from('assessment_controls')
        .insert(acRows);
      if (acError) {
        console.error('Database error assigning assessment controls:', acError);
        throw new Error(`Failed to assign controls to assessment: ${acError.message}`);
      }
    }

    return {
      assessment,
      workspace: getWorkspaceMetadata(user)
    };
  });
}

/**
 * DELETE /api/assessments
 * Delete assessment (owner/admin only or assessment creator)
 */
export async function DELETE(request: NextRequest) {
  return withWorkspaceContext(request, 'delete_assessments', async (context) => {
    const { user } = context;
    
    // Get assessment ID from query parameters
    const url = new URL(request.url);
    const assessmentId = url.searchParams.get('id');
    
    if (!assessmentId) {
      throw new Error('Assessment ID is required');
    }
    
    console.log(`[API] DELETE /api/assessments - User: ${user.profile.email}, ID: ${assessmentId}`);
    
    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);
    
    // First, get the assessment to check ownership
    const { data: assessment, error: fetchError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('workspace_id', user.currentWorkspace!.id)
      .single();
    
    if (fetchError || !assessment) {
      throw new Error('Assessment not found');
    }
    
    // Check if user can delete (resource ownership check)
    const canDelete = checkResourceOwnership(user, assessment.user_id, true);
    
    if (!canDelete) {
      throw new Error('Insufficient permissions to delete this assessment');
    }
    
    // Delete the assessment
    const { error: deleteError } = await supabase
      .from('assessments')
      .delete()
      .eq('id', assessmentId)
      .eq('workspace_id', user.currentWorkspace!.id);
    
    if (deleteError) {
      console.error('Database error deleting assessment:', deleteError);
      throw new Error(`Failed to delete assessment: ${deleteError.message}`);
    }

    return {
      message: 'Assessment deleted successfully',
      deleted_id: assessmentId,
      workspace: getWorkspaceMetadata(user)
    };
  });
}
