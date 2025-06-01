export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Settings {
  workspace_id?: string;
  workspace_name?: string;
  default_compliance_framework?: string;
  locale?: string;
  timezone?: string;
  date_format?: 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  time_format?: '12h' | '24h';
  notifications_enabled?: boolean;
  compliance_frequency: Frequency;
  notification_threshold: number;
  created_at: string;
  updated_at: string;
}
