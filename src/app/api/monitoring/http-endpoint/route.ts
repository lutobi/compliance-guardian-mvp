/**
 * HTTP ENDPOINT MONITORING API - MULTI-TENANT (STANDARDIZED)
 * 
 * Handles HTTP endpoint monitoring operations with workspace context:
 * - POST: Process HTTP endpoint monitoring actions (validate, configure, check, metrics)
 */

import { NextRequest } from 'next/server';
import { HttpEndpointIntegration } from '@/services/integrations/HttpEndpointIntegration';
import { 
  withWorkspaceContext,
  getWorkspaceMetadata
} from '@/lib/api/request-utils';

export const runtime = 'nodejs';

const integration = new HttpEndpointIntegration();

export async function POST(request: NextRequest) {
  return withWorkspaceContext(request, 'manage_monitoring', async (context) => {
    const { user, body } = context;
    const { action, data } = body;
    
    if (!action || !data) {
      throw new Error('Action and data are required');
    }

    console.log(`[API] POST /api/monitoring/http-endpoint - User: ${user.profile.email}, Action: ${action}`);
    
    switch (action) {
      case 'validate': {
        const validation = await integration.validateConfig(data);
        if (!validation.valid) {
          throw new Error(`Invalid configuration: ${validation.errors?.join(', ')}`);
        }
        return {
          ...validation,
          workspace: getWorkspaceMetadata(user)
        };
      }
      case 'configure': {
        await integration.configure(data);
        return {
          success: true,
          message: 'HTTP endpoint configured successfully',
          workspace: getWorkspaceMetadata(user)
        };
      }
      case 'check': {
        const result = await integration.checkStatus(data);
        return {
          ...result,
          workspace: getWorkspaceMetadata(user)
        };
      }
      case 'metrics': {
        const metrics = await integration.getMetrics();
        return {
          metrics,
          workspace: getWorkspaceMetadata(user)
        };
      }
      default:
        throw new Error(`Invalid action: ${action}`);
    }
  });
}
