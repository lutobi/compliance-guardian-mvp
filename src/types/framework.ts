import { Evidence } from './evidence';
import { ControlCoverage } from './coverage';

export type ControlStatus = 'not-started' | 'in-progress' | 'implemented' | 'not-applicable';

export interface Control {
  id: string;
  name: string;
  description: string;
  category?: string;
  subcontrols?: Control[];
  status?: ControlStatus;
  evidence?: Evidence[];
  coverage?: ControlCoverage;
  references?: string[];
  dependencies?: string[];
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  version: string;
  controls: Control[];
  last_synced_at: string;
}

export interface FrameworkData extends Framework {
  controls: Control[];
}

export interface FrameworkUpdateLog {
  id: string;
  framework_id: string;
  updated_at: string;
  changes: any[];
}
