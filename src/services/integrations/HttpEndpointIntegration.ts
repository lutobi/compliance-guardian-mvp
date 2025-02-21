import { MonitoringIntegration } from './MonitoringIntegration';
import { MonitoringPoint, StatusResult } from '@/types/monitoring';

export class HttpEndpointIntegration implements MonitoringIntegration {
  id = 'http-endpoint';
  name = 'HTTP Endpoint';
  type = 'api' as const;

  private endpoints: Map<string, string> = new Map();

  async checkStatus(point: MonitoringPoint): Promise<StatusResult> {
    try {
      const endpoint = this.endpoints.get(point.metric);
      if (!endpoint) {
        throw new Error('Endpoint not configured for this metric');
      }

      // In production, return mock data for demo purposes
      if (process.env.NODE_ENV === 'production' && endpoint.startsWith('/api/mock')) {
        return {
          status: 'compliant',
          timestamp: new Date().toISOString(),
          evidence: {
            type: 'api_response',
            data: {
              message: 'Mock compliance check passed',
              details: 'This is mock data for demonstration purposes'
            }
          }
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          return {
            status: 'failed',
            value: response.status.toString(),
            metadata: {
              error: `HTTP status ${response.status}`,
              timestamp: new Date().toISOString()
            }
          };
        }

        const data = await response.json();
        const value = this.extractValue(data, point.metric);
        const threshold = parseFloat(point.threshold);

        return {
          status: this.evaluateThreshold(value, threshold) ? 'passed' : 'failed',
          value: value.toString(),
          metadata: {
            timestamp: new Date().toISOString(),
            raw_response: JSON.stringify(data)
          }
        };
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          status: 'failed',
          metadata: {
            error: 'Request timeout after 10 seconds',
            timestamp: new Date().toISOString()
          }
        };
      }

      return {
        status: 'unknown',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  private extractValue(data: any, path: string): number {
    const parts = path.split('.');
    let current = data;
    
    for (const part of parts) {
      if (current === undefined || current === null) {
        throw new Error(`Cannot read property '${part}' of undefined`);
      }
      current = current[part];
    }

    const value = parseFloat(current);
    if (isNaN(value)) {
      throw new Error(`Value at path '${path}' is not a number`);
    }

    return value;
  }

  private evaluateThreshold(value: number, threshold: number): boolean {
    return value <= threshold;
  }

  async getMetrics(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    type: 'number' | 'percentage' | 'boolean' | 'string';
    thresholdType?: 'min' | 'max' | 'range' | 'equals';
  }>> {
    return Array.from(this.endpoints.entries()).map(([id, url]) => ({
      id,
      name: `HTTP Endpoint: ${url}`,
      description: 'Monitor HTTP endpoint response metrics',
      type: 'number',
      thresholdType: 'max'
    }));
  }

  async configure(config: Record<string, any>): Promise<void> {
    if (!config.endpoints || typeof config.endpoints !== 'object') {
      throw new Error('Configuration must include endpoints object');
    }

    this.endpoints.clear();
    for (const [key, value] of Object.entries(config.endpoints)) {
      if (typeof value === 'string') {
        this.endpoints.set(key, value);
      }
    }
  }

  async validateConfig(config: Record<string, any>): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    const errors: string[] = [];

    if (!config.endpoints || typeof config.endpoints !== 'object') {
      errors.push('Configuration must include endpoints object');
      return { valid: false, errors };
    }

    for (const [key, value] of Object.entries(config.endpoints)) {
      if (typeof value !== 'string') {
        errors.push(`Endpoint '${key}' must be a string URL`);
        continue;
      }

      try {
        new URL(value);
      } catch {
        errors.push(`Endpoint '${key}' must be a valid URL`);
      }
    }

    // Test each endpoint with a HEAD request
    if (errors.length === 0) {
      const testPromises = Object.entries(config.endpoints).map(async ([key, url]) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for validation

          try {
            const response = await fetch(url, {
              method: 'HEAD',
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
              errors.push(`Endpoint '${key}' returned HTTP ${response.status}`);
            }
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            errors.push(`Endpoint '${key}' timed out after 5 seconds`);
          } else {
            errors.push(`Failed to connect to endpoint '${key}': ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      });

      await Promise.all(testPromises);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}
