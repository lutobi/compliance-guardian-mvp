import { Control, Framework, ControlStatus } from './framework';

export interface EnhancedControl extends Control {
  title: string;
  status: ControlStatus;
  references: string[];
  dependencies: string[];
  riskLevel: 'high' | 'medium' | 'low';
  applicability: string[];
  
  subControls: {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    monitoringPoints?: MonitoringPoint[];
  }[];

  evidenceRequirements: {
    required: EvidenceRequirement[];
    optional: EvidenceRequirement[];
  };

  monitoringPoints: MonitoringPoint[];
}

export interface MonitoringPoint {
  type: 'automated' | 'semi-automated' | 'manual';
  metric: string;
  frequency: string;
  source: string;
  threshold?: string;
  validation?: string;
}

export interface EvidenceRequirement {
  type: string;
  description: string;
  frequency: string;
  retention: string;
  validation?: string[];
}

export interface ControlMapping {
  sourceControl: string;
  targetFramework: string;
  targetControl: string;
  mappingType: 'direct' | 'partial' | 'related';
  coverage: number;
  notes: string;
}

export interface EnhancedFramework extends Framework {
  controls: EnhancedControl[];
  mappings?: ControlMapping[];
}
