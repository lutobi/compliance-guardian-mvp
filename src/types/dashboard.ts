import { MonitoringStatus } from './monitoring';

export interface FrameworkStatusItem {
  id: string;
  name: string;
  complianceRate: number;
  totalControls: number;
  compliantCount: number;
  trend?: number; // Percentage change from previous period
}

export interface RecentActivityItem {
  id: string;
  name: string;
  value: string | number;
  timestamp: string;
  type: 'update' | 'evidence' | 'verification' | 'assessment' | 'other';
  relatedEntity?: {
    id: string;
    name: string;
    type: 'framework' | 'control' | 'evidence';
  };
}

export interface PendingTaskItem {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  frameworkId: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: MonitoringStatus;
}

export interface RiskSummaryItem {
  category: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  percentage: number;
}

export interface VerificationSummary {
  total: number;
  passed: number;
  pending: number;
  failed: number;
  completionRate: number;
}

export interface DashboardData {
  frameworkStatus: FrameworkStatusItem[];
  recentActivity: RecentActivityItem[];
  pendingTasks: PendingTaskItem[];
  riskSummary: RiskSummaryItem[];
  verificationSummary: VerificationSummary;
  lastUpdated: string;
}
