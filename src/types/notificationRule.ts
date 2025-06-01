export type EventType =
  | 'framework_update'
  | 'control_violation'
  | 'evidence_uploaded'
  | 'threshold_breach';
export type Frequency = 'immediate' | 'daily_digest' | 'weekly_digest';

export interface NotificationRule {
  id: string;
  workspace_id: string;
  event_type: EventType;
  filters: Record<string, unknown>;
  channels: string[];
  frequency: Frequency;
  threshold_days?: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}
