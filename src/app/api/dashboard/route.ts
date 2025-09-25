/**
 * DASHBOARD API - MULTI-TENANT (ENHANCED)
 * 
 * Handles dashboard data aggregation with workspace context:
 * - GET: Retrieve dashboard metrics and data for current workspace with caching
 */

import { NextRequest } from 'next/server';
import { 
  withWorkspaceContext, 
  getWorkspaceScopedClient, 
  getWorkspaceMetadata
} from '@/lib/api/request-utils';

export async function GET(request: NextRequest) {
  return withWorkspaceContext(request, 'view_dashboard', async (context) => {
    const { user } = context;
    
    console.log(`[API] GET /api/dashboard - User: ${user.profile.email}, Workspace: ${user.currentWorkspace?.name}`);
    
    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);
    
    // Fetch assessments for workspace (main data)
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('*')
      .eq('workspace_id', user.currentWorkspace!.id)
      .order('created_at', { ascending: false });
      
    if (assessmentsError) {
      console.error('Database error fetching assessments:', assessmentsError);
      throw new Error(`Failed to fetch assessments: ${assessmentsError.message}`);
    }

    // Calculate dashboard stats
    const totalAssessments = assessments?.length || 0;
    const completedAssessments = assessments?.filter(a => a.status === 'completed')?.length || 0;
    const completionRate = totalAssessments > 0 
      ? Math.round((completedAssessments / totalAssessments) * 100) 
      : 0;

    // Return dashboard data
    return {
      success: true,
      data: {
        frameworks: [],
        recentActivities: [],
        pendingTasks: [],
        riskSummary: [],
        verificationSummary: { total: 0, passed: 0, failed: 0, pending: 0, completionRate: 0, recentFindings: [] },
        stats: {
          totalAssessments,
          completedAssessments,
          completionRate
        }
      },
      workspace: getWorkspaceMetadata(user)
    };
  });
}
