/**
 * FILESYSTEM MONITORING API - MULTI-TENANT (STANDARDIZED)
 * 
 * Handles filesystem monitoring operations with workspace context:
 * - POST: Process filesystem monitoring actions (validate, configure, check)
 */

import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import { MonitoringPoint } from '@/types/monitoring';

// Extended interface for filesystem monitoring points
interface FileSystemMonitoringPoint extends MonitoringPoint {
  path: string;
  metric: string;
  threshold: string;
}
import { 
  withWorkspaceContext,
  getWorkspaceMetadata
} from '@/lib/api/request-utils';

export const runtime = 'nodejs';

async function checkFileStatus(point: FileSystemMonitoringPoint) {
  try {
    const stats = await fs.stat(point.path);
    
    switch (point.metric) {
      case 'file.exists':
        return {
          status: 'passed',
          value: 'true',
          metadata: {
            timestamp: new Date().toISOString(),
            last_modified: stats.mtime.toISOString()
          }
        };

      case 'file.size':
        const sizeMB = stats.size / (1024 * 1024);
        const threshold = parseFloat(point.threshold);
        return {
          status: sizeMB <= threshold ? 'passed' : 'failed',
          value: sizeMB.toFixed(2),
          metadata: {
            timestamp: new Date().toISOString(),
            unit: 'MB',
            last_modified: stats.mtime.toISOString()
          }
        };

      case 'file.age':
        const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
        const ageThreshold = parseFloat(point.threshold);
        return {
          status: ageHours <= ageThreshold ? 'passed' : 'failed',
          value: ageHours.toFixed(2),
          metadata: {
            timestamp: new Date().toISOString(),
            unit: 'hours',
            last_modified: stats.mtime.toISOString()
          }
        };

      default:
        throw new Error(`Unsupported metric: ${point.metric}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      return {
        status: 'failed',
        metadata: {
          error: 'File not found',
          timestamp: new Date().toISOString()
        }
      };
    }
    throw error;
  }
}

async function validatePaths(config: Record<string, any>) {
  const errors: string[] = [];

  if (!config.paths || typeof config.paths !== 'object') {
    errors.push('Configuration must include paths object');
    return { valid: false, errors };
  }

  for (const [key, value] of Object.entries(config.paths)) {
    if (typeof value !== 'string') {
      errors.push(`Path '${key}' must be a string`);
      continue;
    }

    try {
      const absolutePath = join(process.cwd(), value);
      await fs.access(join(absolutePath, '..')); // Check if parent directory exists
    } catch {
      errors.push(`Directory for path '${key}' does not exist or is not accessible`);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

export async function POST(request: NextRequest) {
  return withWorkspaceContext(request, 'manage_monitoring', async (context) => {
    const { user, body } = context;
    const { action, data } = body;
    
    if (!action || !data) {
      throw new Error('Action and data are required');
    }

    console.log(`[API] POST /api/monitoring/filesystem - User: ${user.profile.email}, Action: ${action}`);
    
    switch (action) {
      case 'validate':
        return {
          ...await validatePaths(data),
          workspace: getWorkspaceMetadata(user)
        };

      case 'configure':
        // Configuration is handled client-side, just validate
        const validation = await validatePaths(data);
        if (!validation.valid) {
          throw new Error(`Invalid configuration: ${validation.errors?.join(', ')}`);
        }
        return { 
          success: true,
          workspace: getWorkspaceMetadata(user)
        };

      case 'check':
        return {
          ...await checkFileStatus(data),
          workspace: getWorkspaceMetadata(user)
        };

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  });
}
