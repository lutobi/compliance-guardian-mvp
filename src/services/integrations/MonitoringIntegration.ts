import { MonitoringPoint, StatusResult } from '@/types/monitoring';

export interface MonitoringIntegration {
  // Unique identifier for this integration
  id: string;
  
  // Human-readable name
  name: string;
  
  // Type of integration
  type: 'api' | 'webhook' | 'manual';
  
  // Check the status of a monitoring point
  checkStatus(point: MonitoringPoint): Promise<StatusResult>;
  
  // Get available metrics for this integration
  getMetrics(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    type: 'number' | 'percentage' | 'boolean' | 'string';
    thresholdType?: 'min' | 'max' | 'range' | 'equals';
  }>>;
  
  // Configure the integration
  configure(config: Record<string, any>): Promise<void>;
  
  // Validate configuration
  validateConfig(config: Record<string, any>): Promise<{
    valid: boolean;
    errors?: string[];
  }>;
}
