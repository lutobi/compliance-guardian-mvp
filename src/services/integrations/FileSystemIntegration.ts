import { MonitoringIntegration } from './MonitoringIntegration';
import { MonitoringPoint, StatusResult } from '@/types/monitoring';

export class FileSystemIntegration implements MonitoringIntegration {
  id = 'file-system';
  name = 'File System';
  type = 'api' as const;

  private paths: Map<string, string> = new Map();

  async checkStatus(point: MonitoringPoint): Promise<StatusResult> {
    try {
      const filePath = this.paths.get(point.metric);
      if (!filePath) {
        throw new Error('File path not configured for this metric');
      }

      // In production, return mock data for demo purposes
      if (process.env.NODE_ENV === 'production' && filePath.startsWith('/mock/')) {
        return {
          status: 'compliant',
          timestamp: new Date().toISOString(),
          evidence: {
            type: 'file_analysis',
            data: {
              message: 'Mock file analysis passed',
              details: 'This is mock data for demonstration purposes',
              path: filePath
            }
          }
        };
      }

      // Make API call to our server endpoint
      const response = await fetch('/api/monitoring/filesystem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'check',
          data: {
            ...point,
            path: filePath
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check file status');
      }

      return await response.json();
    } catch (error) {
      return {
        status: 'unknown',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  async getMetrics(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    type: 'number' | 'percentage' | 'boolean' | 'string';
    thresholdType?: 'min' | 'max' | 'range' | 'equals';
  }>> {
    return [
      {
        id: 'file.exists',
        name: 'File Exists',
        description: 'Check if a file exists',
        type: 'boolean'
      },
      {
        id: 'file.size',
        name: 'File Size',
        description: 'Monitor file size in MB',
        type: 'number',
        thresholdType: 'max'
      },
      {
        id: 'file.age',
        name: 'File Age',
        description: 'Monitor file age in hours',
        type: 'number',
        thresholdType: 'max'
      }
    ];
  }

  async configure(config: Record<string, any>): Promise<void> {
    if (!config.paths || typeof config.paths !== 'object') {
      throw new Error('Configuration must include paths object');
    }

    // Validate configuration through API
    const validateResponse = await fetch('/api/monitoring/filesystem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'validate',
        data: config
      })
    });

    if (!validateResponse.ok) {
      const error = await validateResponse.json();
      throw new Error(error.message || 'Failed to validate configuration');
    }

    const { valid, errors } = await validateResponse.json();
    if (!valid) {
      throw new Error(errors?.join(', ') || 'Invalid configuration');
    }

    // Store configuration
    this.paths.clear();
    for (const [key, value] of Object.entries(config.paths)) {
      if (typeof value === 'string') {
        this.paths.set(key, value);
      }
    }

    // Configure through API
    const configureResponse = await fetch('/api/monitoring/filesystem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'configure',
        data: config
      })
    });

    if (!configureResponse.ok) {
      const error = await configureResponse.json();
      throw new Error(error.message || 'Failed to apply configuration');
    }
  }

  async validateConfig(config: Record<string, any>): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    if (!config.paths || typeof config.paths !== 'object') {
      return {
        valid: false,
        errors: ['Configuration must include paths object']
      };
    }

    const errors: string[] = [];

    for (const [key, value] of Object.entries(config.paths)) {
      if (typeof value !== 'string') {
        errors.push(`Path '${key}' must be a string`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    try {
      const response = await fetch('/api/monitoring/filesystem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'validate',
          data: config
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Validation failed');
      }

      return await response.json();
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Failed to validate configuration']
      };
    }
  }
}
