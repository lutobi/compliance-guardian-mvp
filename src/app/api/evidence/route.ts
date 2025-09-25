/**
 * EVIDENCE API - MULTI-TENANT (MIGRATED TO NEW SECURE PATTERN)
 * 
 * Handles evidence/document management operations with workspace context:
 * - GET: List evidence by framework, subcontrol, or assessment with pagination
 * - POST: Create new evidence in workspace
 * - PUT: Update existing evidence
 * - DELETE: Remove evidence from workspace
 */

import { NextRequest } from 'next/server';
import { Evidence } from '@/types/evidence';
import { 
  withWorkspaceContext, 
  extractPaginationParams, 
  createPaginatedResponse,
  getWorkspaceScopedClient,
  getWorkspaceMetadata 
} from '@/lib/api/request-utils';

export async function GET(request: NextRequest) {
  return withWorkspaceContext(request, 'view_evidence', async (context) => {
    const { user } = context;
    const pagination = extractPaginationParams(request);
    
    // Get query parameters
    const url = new URL(request.url);
    const rawFrameworkId = url.searchParams.get('frameworkId');
    const subcontrolId = url.searchParams.get('subcontrolId');
    const assessmentId = url.searchParams.get('assessmentId');

    console.log(`[API] GET /api/evidence - User: ${user.profile.email}, Workspace: ${user.currentWorkspace?.name}`);

    // Get workspace-scoped database client (used for auth context only)
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);

    // Build workspace-scoped query with filters
    let query = supabase
      .from('evidence')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Resolve and apply framework filter (accept UUID or slug)
    if (rawFrameworkId) {
      let frameworkId = rawFrameworkId;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(rawFrameworkId)) {
        const { data: fw, error: fwErr } = await supabase
          .from('frameworks')
          .select('id')
          .eq('slug', rawFrameworkId)
          .maybeSingle();
        if (fwErr) {
          console.error('Error resolving framework slug for evidence GET:', fwErr);
        }
        if (!fw?.id) {
          // Slug not found in DB: return empty results instead of invalid UUID filter
          return [];
        }
        frameworkId = fw.id;
      }
      query = query.eq('framework_id', frameworkId);
    }
    if (subcontrolId) {
      query = query.eq('subcontrol_id', subcontrolId);
    }

    // Apply pagination
    query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error fetching evidence:', error);
      throw new Error(`Failed to fetch evidence: ${error.message}`);
    }

    // Map database results to Evidence type
    const formattedData = data?.map((item: any) => ({
      id: item.id,
      subcontrolId: item.subcontrol_id,
      frameworkId: item.framework_id,
      files: item.files || [],
      notes: item.notes || '',
      tags: item.tags || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      controlName: item.title?.replace('Evidence for ', '') || ''
    })) || [];

    // Return array directly; wrapper will place under data
    return formattedData;
  });
}

export async function POST(request: NextRequest) {
  return withWorkspaceContext(request, 'create_evidence', async (context) => {
    const { user, body } = context;
    
    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);
    
    console.log(`[API] POST /api/evidence - User: ${user.profile.email}, Body:`, body);
    
    // Validation
    if (!body.frameworkId) {
      throw new Error('frameworkId is required');
    }

    // Determine title
    const controlName = body.controlName || 'control';
    const title = `Evidence for ${controlName}`;
    
    // Resolve frameworkId if provided as slug
    let frameworkId: string | null = body.frameworkId || null;
    if (frameworkId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(frameworkId)) {
        const { data: fw, error: fwErr } = await supabase
          .from('frameworks')
          .select('id')
          .eq('slug', frameworkId)
          .maybeSingle();
        if (fwErr) {
          console.error('Error resolving framework slug for evidence POST:', fwErr);
          throw new Error(`Failed to create evidence: ${fwErr.message}`);
        }
        frameworkId = fw?.id || null;
      }
    }
    if (!frameworkId) {
      throw new Error('Invalid frameworkId');
    }

    // Build evidence record
    const record: any = {
      subcontrol_id: body.subcontrolId || null,
      framework_id: frameworkId,
      user_id: user.profile.id,
      workspace_id: user.currentWorkspace!.id,
      title,
      notes: body.notes || '',
      tags: body.tags || [],
      files: body.files || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Inserting evidence record (with workspace_id):', record);
    let insertRes = await supabase
      .from('evidence')
      .insert(record)
      .select('*')
      .single();

    // Handle missing workspace_id column gracefully (older schema)
    if (insertRes.error && typeof insertRes.error.message === 'string') {
      const msg = insertRes.error.message.toLowerCase();
      const missingColumn = msg.includes("could not find the 'workspace_id' column") || msg.includes('column "workspace_id" does not exist');
      if (missingColumn) {
        console.warn('[Evidence POST] workspace_id column missing, retrying insert without it');
        const { workspace_id, ...fallbackRecord } = record;
        insertRes = await supabase
          .from('evidence')
          .insert(fallbackRecord)
          .select('*')
          .single();
      }
    }

    if (insertRes.error) {
      console.error('Database error creating evidence:', insertRes.error);
      throw new Error(`Failed to create evidence: ${insertRes.error.message}`);
    }
    
    console.log('Evidence created successfully:', insertRes.data);
    
    // Map the response to the Evidence type
    const row = insertRes.data as any;
    const mappedData: Evidence = {
      id: row.id,
      subcontrolId: row.subcontrol_id,
      frameworkId: row.framework_id,
      files: row.files || [],
      notes: row.notes || '',
      tags: row.tags || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      controlName: body.controlName || ''
    };
    
    // Return created Evidence directly
    return mappedData;
  });
}

export async function PUT(request: NextRequest) {
  return withWorkspaceContext(request, 'edit_evidence', async (context) => {
    const { user, body } = context;
    
    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);
    
    const { id } = body;
    if (!id) {
      throw new Error('Evidence ID is required');
    }
    
    console.log(`[API] PUT /api/evidence - User: ${user.profile.email}, Evidence: ${id}`);
    
    // Verify evidence exists and belongs to workspace
    const { data: existingEvidence, error: fetchError } = await supabase
      .from('evidence')
      .select('id, user_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingEvidence) {
      throw new Error('Evidence not found');
    }
    
    // Check permissions (owner or admin can edit)
    const isOwner = existingEvidence.user_id === user.profile.id;
    const isAdmin = user.currentMembership?.role === 'admin' || user.currentMembership?.role === 'owner';
    
    if (!isOwner && !isAdmin) {
      throw new Error('Insufficient permissions to edit this evidence');
    }
    
    // Build update record
    const record: any = {
      updated_at: new Date().toISOString()
    };
    
    if (body.notes !== undefined) record.notes = body.notes;
    if (body.tags !== undefined) record.tags = body.tags;
    if (body.files !== undefined) record.files = body.files;
    
    const { data, error } = await supabase
      .from('evidence')
      .update(record)
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) {
      console.error('Database error updating evidence:', error);
      throw new Error(`Failed to update evidence: ${error.message}`);
    }
    
    // Map response to Evidence type
    const mappedData: Evidence = {
      id: data.id,
      subcontrolId: data.subcontrol_id,
      frameworkId: data.framework_id,
      files: data.files || [],
      notes: data.notes || '',
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      controlName: data.title?.replace('Evidence for ', '') || ''
    };
    
    // Return updated Evidence directly
    return mappedData;
  });
}

export async function DELETE(request: NextRequest) {
  return withWorkspaceContext(request, 'delete_evidence', async (context) => {
    const { user, body } = context;
    
    const { id } = body;
    if (!id) {
      throw new Error('Evidence ID is required');
    }
    
    console.log(`[API] DELETE /api/evidence - User: ${user.profile.email}, Evidence: ${id}`);

    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);
    
    // Verify evidence exists and belongs to workspace
    const { data: existingEvidence, error: fetchError } = await supabase
      .from('evidence')
      .select('id, user_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingEvidence) {
      throw new Error('Evidence not found');
    }
    
    // Check permissions (owner or admin can delete)
    const isOwner = existingEvidence.user_id === user.profile.id;
    const isAdmin = user.currentMembership?.role === 'admin' || user.currentMembership?.role === 'owner';
    
    if (!isOwner && !isAdmin) {
      throw new Error('Insufficient permissions to delete this evidence');
    }
    
    const { error } = await supabase
      .from('evidence')
      .delete()
      .eq('id', id)
      ;
      
    if (error) {
      console.error('Database error deleting evidence:', error);
      throw new Error(`Failed to delete evidence: ${error.message}`);
    }
    
    return { 
      id,
      message: 'Evidence deleted successfully'
    };
  });
}
