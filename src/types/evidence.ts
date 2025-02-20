export type Evidence = {
  type: string;
  description: string;
  frequency: string;
  retention: string;
  validation?: string[];
  files?: string[];
  notes?: string;
  timestamp?: string;   // ISO string format
  version?: number;     // For future migrations
};

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
