/**
 * MONITORING API - MULTI-TENANT (STANDARDIZED)
 * 
 * Handles compliance monitoring operations with workspace context:
 * - GET: Fetch monitoring configuration for framework
 * - POST: Create or update monitoring settings
 */

import { NextRequest } from 'next/server';
import { 
  withWorkspaceContext,
  getWorkspaceScopedClient,
  getWorkspaceMetadata
} from '@/lib/api/request-utils';

export async function GET(request: NextRequest) {
  return withWorkspaceContext(request, 'view_monitoring', async (context) => {
    const { user, workspaceContext } = context;
    
    // Get query parameters
    const url = new URL(request.url);
    const rawFrameworkId = url.searchParams.get('frameworkId');

    if (!rawFrameworkId) {
      throw new Error('Framework ID is required');
    }
    
    // Get workspace-scoped database client (use workspace ID, not slug)
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);
    
    console.log(`[API] GET /api/monitoring - User: ${user.profile.email}, Framework: ${rawFrameworkId}`);

    // Resolve framework identifier: accept either UUID (frameworks.id) or slug
    let frameworkId: string | null = null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(rawFrameworkId)) {
      frameworkId = rawFrameworkId;
    } else {
      const { data: fw, error: fwErr } = await supabase
        .from('frameworks')
        .select('id')
        .eq('slug', rawFrameworkId)
        .maybeSingle();
      if (fwErr) {
        console.error('Error resolving framework slug:', fwErr);
        throw new Error(`Failed to fetch monitoring configuration: ${fwErr.message}`);
      }
      frameworkId = fw?.id || null;
    }

    if (!frameworkId) {
      return {
        monitoring: null,
        workspace: getWorkspaceMetadata(user)
      };
    }

    const { data, error } = await supabase
      .from('monitoring')
      .select('*')
      .eq('framework_id', frameworkId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching monitoring:', error);
      throw new Error(`Failed to fetch monitoring configuration: ${error.message}`);
    }

    return { 
      monitoring: data,
      workspace: getWorkspaceMetadata(user)
    };
  });
}

export async function POST(request: NextRequest) {
  return withWorkspaceContext(request, 'manage_monitoring', async (context) => {
    const { user, body, workspaceContext } = context;
    
    if (!body) {
      throw new Error('Request body is required');
    }
    
    const { frameworkId } = body;
    if (!frameworkId) {
      throw new Error('Framework ID is required');
    }
    
    console.log(`[API] POST /api/monitoring - User: ${user.profile.email}, Framework: ${frameworkId}`);

    // Get workspace-scoped database client (use workspace ID, not slug)
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);

    // Consolidate incoming settings into a single JSON field to match DB schema
    const nowIso = new Date().toISOString();
    const settings = body.settings ?? {
      enabled: body.enabled ?? false,
      frequency: body.frequency || 'daily',
      notification_settings: body.notification_settings || {},
      thresholds: body.thresholds || {}
    };

    // Try to find existing row by framework_id (table has no workspace_id column)
    const { data: existing, error: fetchErr } = await supabase
      .from('monitoring')
      .select('*')
      .eq('framework_id', frameworkId)
      .maybeSingle();

    if (fetchErr) {
      console.error('Error fetching existing monitoring:', fetchErr);
      throw new Error(`Failed to save monitoring configuration: ${fetchErr.message}`);
    }

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('monitoring')
        .update({ settings, updated_at: nowIso })
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) {
        console.error('Error updating monitoring configuration:', error);
        throw new Error(`Failed to save monitoring configuration: ${error.message}`);
      }
      result = data;
    } else {
      // Try insert with workspace and user context for RLS
      const baseRecord: any = { framework_id: frameworkId as any, settings, created_at: nowIso, updated_at: nowIso };
      let record: any = { ...baseRecord, workspace_id: user.currentWorkspace!.id, user_id: user.profile.id };
      let insert = await supabase
        .from('monitoring')
        .insert(record)
        .select('*')
        .single();

      if (insert.error && typeof insert.error.message === 'string') {
        const msg = insert.error.message.toLowerCase();
        const missingWorkspace = msg.includes("could not find the 'workspace_id' column") || msg.includes('column "workspace_id" does not exist');
        const missingUser = msg.includes("could not find the 'user_id' column") || msg.includes('column "user_id" does not exist');
        if (missingWorkspace || missingUser) {
          // Remove missing columns and retry
          const retryRecord = { ...baseRecord } as any;
          if (!missingWorkspace) retryRecord.workspace_id = user.currentWorkspace!.id;
          if (!missingUser) retryRecord.user_id = user.profile.id;
          console.warn('[Monitoring POST] Missing columns, retrying insert with:', Object.keys(retryRecord));
          insert = await supabase
            .from('monitoring')
            .insert(retryRecord)
            .select('*')
            .single();
        }
      }

      if (insert.error) {
        console.error('Error creating monitoring configuration:', insert.error);
        throw new Error(`Failed to save monitoring configuration: ${insert.error.message}`);
      }
      result = insert.data;
    }

    return {
      monitoring: result,
      message: 'Monitoring configuration saved successfully',
      workspace: getWorkspaceMetadata(user)
    };
  });
}
