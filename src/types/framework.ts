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
  categories: string[];
  lastUpdated?: string;
  implementationProgress?: number;
  totalControls?: number;
  implementedControls?: number;
  controls: Control[];
}

export interface FrameworkData extends Framework {
  controls: Control[];
}
