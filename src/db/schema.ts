import { FrameworkControl } from '@/types/framework';

// Monitoring Status Types
export type MonitoringStatus = 'active' | 'inactive' | 'error' | 'pending';
export type ComplianceStatus = 'compliant' | 'non-compliant' | 'partial' | 'not-applicable';
export type EvidenceStatus = 'valid' | 'invalid' | 'expired' | 'pending-review';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

// Base Schema Types
export interface BaseRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Evidence Schema
export interface Evidence extends BaseRecord {
  controlId: string;
  subControlId?: string;
  type: string;
  content: string;
  source: string;
  status: EvidenceStatus;
  validUntil?: Date;
  metadata: Record<string, any>;
  reviewHistory: EvidenceReview[];
}

export interface EvidenceReview extends BaseRecord {
  evidenceId: string;
  reviewerId: string;
  status: EvidenceStatus;
  comments: string;
  attachments?: string[];
}

// Monitoring Point Schema
export interface MonitoringPoint extends BaseRecord {
  controlId: string;
  subControlId?: string;
  type: 'automated' | 'semi-automated' | 'manual';
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  lastCheck: Date;
  nextCheck: Date;
  status: MonitoringStatus;
  configuration: {
    source: string;
    metric: string;
    threshold?: number | string;
    evaluationCriteria: string;
    parameters: Record<string, any>;
  };
  results: MonitoringResult[];
}

export interface MonitoringResult extends BaseRecord {
  monitoringPointId: string;
  status: ComplianceStatus;
  value: number | string;
  metadata: Record<string, any>;
  evidenceIds: string[];
}

// Alert Schema
export interface Alert extends BaseRecord {
  controlId: string;
  subControlId?: string;
  monitoringPointId?: string;
  type: string;
  severity: AlertSeverity;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

// Control Implementation Schema
export interface ControlImplementation extends BaseRecord {
  controlId: string;
  subControlId?: string;
  framework: string;
  status: ComplianceStatus;
  implementationDetails: {
    responsible: string;
    accountable: string;
    consulted: string[];
    informed: string[];
    procedures: string[];
    technologies: string[];
    dependencies: string[];
  };
  monitoringPoints: string[]; // References to MonitoringPoint.id
  evidence: string[]; // References to Evidence.id
  reviewSchedule: {
    frequency: string;
    lastReview?: Date;
    nextReview: Date;
    reviewers: string[];
  };
}

// Validation Schema
export interface ValidationResult extends BaseRecord {
  controlId: string;
  subControlId?: string;
  type: 'automated' | 'manual';
  status: 'pass' | 'fail' | 'warning';
  details: {
    rule: string;
    expected: any;
    actual: any;
    message: string;
  }[];
  evidence: string[]; // References to Evidence.id
}

// Reporting Schema
export interface ComplianceReport extends BaseRecord {
  type: 'framework' | 'control' | 'custom';
  scope: {
    frameworks?: string[];
    controls?: string[];
    timeframe: {
      start: Date;
      end: Date;
    };
  };
  status: 'draft' | 'final' | 'archived';
  results: {
    overallStatus: ComplianceStatus;
    controlResults: {
      controlId: string;
      status: ComplianceStatus;
      evidence: string[];
      validationResults: string[];
    }[];
    statistics: {
      total: number;
      compliant: number;
      nonCompliant: number;
      partial: number;
      notApplicable: number;
    };
  };
  metadata: Record<string, any>;
}

// Database Tables
export interface DatabaseSchema {
  evidence: Evidence[];
  evidenceReviews: EvidenceReview[];
  monitoringPoints: MonitoringPoint[];
  monitoringResults: MonitoringResult[];
  alerts: Alert[];
  controlImplementations: ControlImplementation[];
  validationResults: ValidationResult[];
  complianceReports: ComplianceReport[];
}
