export interface Evidence {
  id: string;
  subcontrolId: string;
  frameworkId: string;
  controlId?: string; // Optional reference to the parent control
  assessmentId?: string; // Optional reference to an assessment
  files: EvidenceFile[];
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  controlName?: string; // Optional control name for better titles
  createdBy?: string; // User ID who created the evidence
  updatedBy?: string; // User ID who last updated the evidence
  status?: 'draft' | 'submitted' | 'approved' | 'rejected'; // Evidence status
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
