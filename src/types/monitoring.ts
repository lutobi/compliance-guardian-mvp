import { Framework } from './framework';
import { Control } from './control';

export type MonitoringStatus = 'pending' | 'compliant' | 'non_compliant' | 'review_required';
export type ReviewCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type AutomationLevel = 'manual' | 'semi_automated' | 'fully_automated';
export type EvidenceType = 'document' | 'test_result' | 'audit_report' | 'screen_capture' | 'log_file';
export type MonitoringFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface MonitoringPoint {
  id: string;
  name: string;
  description: string;
  status: MonitoringStatus;
  last_review_date: Date | null;
  next_review_date: Date;
  reviewers: string[];
  evidence_required: boolean;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface FrameworkMonitoring extends MonitoringPoint {
  framework_id: string;
  settings: {
    frequency: MonitoringFrequency;
    evidenceType: EvidenceType;
    priority: Priority;
    automationLevel: AutomationLevel;
  };
  created_at: Date;
  updated_at: Date;
  framework: {
    id: string;
    name: string;
    description: string;
    slug: string;
  };
}

export interface CategoryMonitoring extends MonitoringPoint {
  category: string;
  framework_id: string;
  framework: {
    id: string;
    name: string;
    description: string;
  };
}

export interface ControlMonitoring extends MonitoringPoint {
  monitoring_id: string;
  control_id: string;
  status: MonitoringStatus;
  last_checked: Date | null;
  next_check: Date;
  control: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
}

export interface Evidence {
  id: string;
  monitoring_point_id: string;
  type: EvidenceType;
  title: string;
  description: string;
  uploaded_by: string;
  upload_date: Date;
  valid_until: Date | null;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface MonitorConfig {
  framework_id?: string;
  frameworks: string[];
  controls: string[];
  frequency?: MonitoringFrequency;
  evidence_type?: EvidenceType;
  priority?: Priority;
  automation_level?: AutomationLevel;
  evidence_required: boolean;
  alert_threshold: string;
  created_at?: Date;
  status?: 'active' | 'inactive';
}
