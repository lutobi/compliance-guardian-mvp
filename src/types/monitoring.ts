import { Framework } from './framework';
import { Control } from './control';

export type MonitoringStatus = 'compliant' | 'at_risk' | 'non_compliant';
export type ReviewCycle = 'weekly' | 'monthly' | 'quarterly';
export type Priority = 'high' | 'medium' | 'low';
export type AutomationLevel = 'full' | 'semi' | 'manual';
export type EvidenceType = 'document' | 'metric' | 'automated_check';
export type MonitoringFrequency = 'daily' | 'weekly' | 'monthly';

export interface MonitoringPoint {
  id: string;
  name: string;
  description: string;
  status: MonitoringStatus;
  lastReviewDate: Date;
  nextReviewDate: Date;
  reviewers: string[];
  evidenceRequired: boolean;
}

export interface FrameworkMonitoring extends MonitoringPoint {
  frameworkId: string;
  framework: Framework;
  reviewCycle: ReviewCycle;
  categories: CategoryMonitoring[];
}

export interface CategoryMonitoring extends MonitoringPoint {
  categoryId: string;
  priority: Priority;
  automationLevel: AutomationLevel;
  controls: ControlMonitoring[];
}

export interface ControlMonitoring extends MonitoringPoint {
  controlId: string;
  control: Control;
  evidenceType: EvidenceType;
  frequency: MonitoringFrequency;
  alertThreshold?: number;
  metrics?: MonitoringMetric[];
}

export interface MonitoringMetric {
  id: string;
  name: string;
  value: number;
  threshold: number;
  unit: string;
  timestamp: Date;
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  uploadedBy: string;
  uploadDate: Date;
  validUntil: Date;
  metadata: Record<string, unknown>;
  url?: string;
  metricId?: string;
}

export interface MonitorConfig {
  id?: string;
  name: string;
  description: string;
  frameworks: string[];
  categories: string[];
  controls: string[];
  reviewCycle: ReviewCycle;
  priority: Priority;
  frequency: MonitoringFrequency;
  automationLevel: AutomationLevel;
  evidenceRequired: boolean;
  evidenceType?: EvidenceType;
  alertThreshold: string;
  createdAt?: Date;
  status?: 'active' | 'inactive';
}
