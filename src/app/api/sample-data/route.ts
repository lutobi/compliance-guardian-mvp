/**
 * SAMPLE DATA API - MULTI-TENANT (STANDARDIZED)
 * 
 * Provides endpoints to initialize sample data for demo or testing purposes
 * - GET: Insert sample data into current workspace (requires admin permission)
 */

import { NextRequest } from 'next/server';
import { insertSampleData } from '@/app/dashboard/frameworks/sample-data';
import { 
  withWorkspaceContext,
  getWorkspaceMetadata
} from '@/lib/api/request-utils';

export async function GET(request: NextRequest) {
  return withWorkspaceContext(request, 'manage_settings', async (context) => {
    const { user, workspaceContext } = context;
    
    // Check if user has admin/owner role in workspace
    if (user.currentMembership?.role !== 'admin' && user.currentMembership?.role !== 'owner') {
      throw new Error('Only workspace administrators can initialize sample data');
    }
    
    console.log(`[API] GET /api/sample-data - User: ${user.profile.email}, Workspace: ${workspaceContext.slug}`);
    
    // Insert sample data into current workspace
    // Note: The current implementation doesn't take workspace context yet, but will be updated
    await insertSampleData();
    
    return {
      success: true,
      message: 'Sample data initialized successfully',
      workspace: getWorkspaceMetadata(user)
    };
  });
}
