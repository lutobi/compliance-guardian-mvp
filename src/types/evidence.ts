export interface Evidence {
  id: string;
  subcontrolId: string;
  frameworkId: string;
  files: Array<{
    name: string;
    size: number;
  }>;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  controlName?: string; // Optional control name for better titles
}

export interface EvidenceFile {
  name: string;
  size: number;
  type?: string;
  url?: string;
  id?: string;
}

export type EvidenceRequirement = {
  type: string;
  description: string;
  validationRules?: {
    fileTypes?: string[];
    minFiles?: number;
    maxFiles?: number;
    requiredFields?: string[];
  };
};

export type EvidenceMap = {
  [subcontrolId: string]: Evidence[];
};

export type OperationResult<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

export type OperationState = {
  type: 'idle' | 'loading' | 'success' | 'error';
  operation: 'save' | 'delete' | 'update' | null;
  message?: string;
};
