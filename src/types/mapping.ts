import { Control } from './framework';

export type MappingStrength = 'strong' | 'moderate' | 'weak';

export interface ControlMapping {
  sourceControlId: string;
  targetControlId: string;
  strength: MappingStrength;
  coverage: number; // 0-1
  notes?: string;
}

export interface FrameworkMapping {
  sourceFrameworkId: string;
  targetFrameworkId: string;
  mappings: ControlMapping[];
  overallCoverage: number;
  lastUpdated: string; // ISO date string
}

export interface MappingSuggestion {
  sourceControl: Control;
  targetControl: Control;
  confidence: number;
  rationale: string;
}

export interface MappingStats {
  totalMappings: number;
  strongMappings: number;
  moderateMappings: number;
  weakMappings: number;
  unmappedControls: number;
}

export interface MappingFilter {
  strength?: MappingStrength;
  minCoverage?: number;
  maxCoverage?: number;
  hasNotes?: boolean;
}
