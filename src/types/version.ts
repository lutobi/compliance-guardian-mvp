export interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
  releaseDate: string;
  changelog: string[];
  breaking?: boolean;
  features?: string[];
  bugfixes?: string[];
}

export interface VersionHistory {
  versions: VersionInfo[];
  latestVersion: string;
  minimumVersion: string;
}
