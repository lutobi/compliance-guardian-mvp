export type CoverageLevel = 'none' | 'partial' | 'full';

export interface ControlCoverage {
  controlId: string;
  level: CoverageLevel;
  percentage: number;
  evidenceCount: number;
  implementationStatus: 'not-started' | 'in-progress' | 'implemented' | 'not-applicable';
}

export interface FrameworkCoverage {
  frameworkId: string;
  overallCoverage: number;
  controlCoverage: ControlCoverage[];
  implementedControls: number;
  totalControls: number;
  lastUpdated: string; // ISO date string
}

export interface CoverageFilter {
  level?: CoverageLevel;
  minPercentage?: number;
  maxPercentage?: number;
  implementationStatus?: ControlCoverage['implementationStatus'];
}

export interface CoverageSummary {
  totalFrameworks: number;
  averageCoverage: number;
  frameworksCoverage: {
    frameworkId: string;
    name: string;
    coverage: number;
  }[];
}
