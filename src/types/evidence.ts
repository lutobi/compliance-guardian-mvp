export type Evidence = {
  id: string;
  files: string[];     // Never undefined
  notes: string;       // Never undefined
  timestamp: string;   // ISO string format
  version: number;     // For future migrations
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
