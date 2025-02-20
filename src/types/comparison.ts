import { Control, Framework } from './framework';

export type ComparisonView = 'overview' | 'controls' | 'requirements';

export interface FrameworkSimilarities {
  commonControls: number;
  sharedObjectives: string[];
  commonCategories: string[];
}

export interface FrameworkDifferences {
  uniqueControls: {
    framework1: string[];
    framework2: string[];
  };
  scopeDifferences: string[];
}

export interface ControlComparison {
  controlId: string;
  name: string;
  category: string;
  isCommon: boolean;
  matchingControlId?: string;
}

export type MappingType = 'direct' | 'partial' | 'related' | 'none';

export interface ControlMapping {
  sourceControlId: string;
  targetControlId: string;
  mappingType: MappingType;
  coverage: number;
  notes?: string;
}

export interface GapAnalysis {
  coverage: number;
  unmappedSourceControls: string[];
  unmappedTargetControls: string[];
  recommendations: string[];
}

export interface FrameworkComparison {
  sourceFramework: Framework;
  targetFramework: Framework;
  similarities: FrameworkSimilarities;
  differences: FrameworkDifferences;
  controls: ControlComparison[];
  mappings: ControlMapping[];
  gapAnalysis: GapAnalysis;
  statistics: {
    similarityScore: number;
    totalControls: {
      source: number;
      target: number;
      common: number;
    };
    implementationEstimate: {
      timelineMonths: number;
      complexity: 'low' | 'medium' | 'high';
    };
  };
}

export interface ComparisonState {
  selectedFrameworks: string[];
  activeView: ComparisonView;
  comparison: FrameworkComparison | null;
}
