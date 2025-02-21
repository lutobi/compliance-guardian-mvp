export interface Control {
  id: string;
  name: string;
  description: string;
  category?: string;
  framework?: string;
  status?: 'not-started' | 'in-progress' | 'implemented' | 'not-applicable';
  evidence?: string[];
  dependencies?: string[];
  references?: string[];
}
