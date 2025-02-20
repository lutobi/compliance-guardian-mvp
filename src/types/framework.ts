export interface Control {
  id: string;
  name: string;
  description: string;
  subcontrols?: Control[];
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  version: string;
  categories: string[];
}

export interface FrameworkData extends Framework {
  controls: Control[];
}
