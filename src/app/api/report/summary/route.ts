/**
 * REPORT SUMMARY API - MULTI-TENANT (STANDARDIZED)
 * 
 * Provides assessment compliance summary with workspace context:
 * - GET: Generate compliance score and control status counts
 */

import { NextRequest } from 'next/server';
import { 
  withWorkspaceContext,
  getWorkspaceScopedClient,
  getWorkspaceMetadata
} from '@/lib/api/request-utils';
import { z } from 'zod';

const requestSchema = z.object({ 
  assessmentId: z.string().uuid() 
});

export async function GET(request: NextRequest) {
  return withWorkspaceContext(request, 'view_reports', async (context) => {
    // Get query parameters
    const { user, workspaceContext } = context;
    const url = new URL(request.url);
    const assessmentId = url.searchParams.get('assessmentId');

    if (!assessmentId) {
      throw new Error('Assessment ID is required');
    }

    // Validate assessment ID format
    const parse = requestSchema.safeParse({ assessmentId });
    if (!parse.success) {
      throw new Error('Invalid assessment ID format');
    }
    
    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(workspaceContext.slug);
    
    console.log(`[API] GET /api/report/summary - User: ${user.profile.email}, Assessment: ${assessmentId}`);

    // First verify assessment belongs to workspace
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, workspace_id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      throw new Error('Assessment not found');
    }

    // Query assessment_controls table for summary counts
    const [
      { count: total }, 
      { count: compliant }, 
      { count: nonCompliant }
    ] = await Promise.all([
      supabase
        .from('assessment_controls')
        .select('*', { head: true, count: 'exact' })
        .eq('assessment_id', assessmentId),
      supabase
        .from('assessment_controls')
        .select('*', { head: true, count: 'exact' })
        .eq('assessment_id', assessmentId)
        .eq('status', 'implemented'),
      supabase
        .from('assessment_controls')
        .select('*', { head: true, count: 'exact' })
        .eq('assessment_id', assessmentId)
        .eq('status', 'not_compliant'),
    ]);

    const totalCount = total ?? 0;
    const compliantCount = compliant ?? 0;
    const nonCompliantCount = nonCompliant ?? 0;
    const pendingCount = totalCount - compliantCount - nonCompliantCount;
    const score = totalCount > 0 ? Number(((compliantCount / totalCount) * 100).toFixed(2)) : 0;

    return {
      summary: {
        score,
        compliant: compliantCount,
        nonCompliant: nonCompliantCount,
        pending: pendingCount,
        total: totalCount
      },
      assessment: {
        id: assessment.id,
        workspace_id: assessment.workspace_id
      },
      workspace: getWorkspaceMetadata(user)
    };
  });
}
