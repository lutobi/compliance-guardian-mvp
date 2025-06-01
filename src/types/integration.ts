export type IntegrationType = 'slack' | 'email' | 'webhook' | 'jira';

export interface Integration {
  id: string;
  workspace_id: string;
  type: IntegrationType;
  config: Record<string, any>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}
