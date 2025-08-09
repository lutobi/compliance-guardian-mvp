/**
 * Settings and Team Members Schema Definitions
 * 
 * This file provides type-safe schema definitions for settings and team_members tables
 * to ensure consistency across the application and prevent type mismatches.
 */

import { Database } from '../database.types';

/**
 * Settings table schema based on actual database structure
 * Includes all columns from migrations to prevent schema mismatches
 */
export type WorkspaceSettings = {
  id: string;
  workspace_id: string; // Always use as string type even if stored as UUID in DB
  workspace_name: string;
  default_compliance_framework?: string;
  locale?: string;
  timezone?: string;
  date_format?: 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  time_format?: '12h' | '24h';
  notifications_enabled?: boolean;
  compliance_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  notification_threshold?: number;
  created_at?: string | Date;
  updated_at?: string | Date;
};

/**
 * Settings insert payload with required validation
 */
export type WorkspaceSettingsInsert = Omit<WorkspaceSettings, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

/**
 * Team member schema based on actual database structure
 */
export type TeamMember = {
  id: string;
  workspace_id: string; // Always use as string type to match settings.workspace_id
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'active';
  invited_at: string | Date;
  accepted_at?: string | Date;
};

/**
 * Team member insert payload
 */
export type TeamMemberInsert = Omit<TeamMember, 'id' | 'invited_at' | 'accepted_at'> & {
  id?: string;
};

/**
 * Utility function to ensure workspace_id is consistently formatted as string
 * This prevents type mismatches between UUID and string representations
 */
export function normalizeWorkspaceId(workspaceId: string | undefined): string | undefined {
  if (!workspaceId) return undefined;
  return String(workspaceId);
}

/**
 * Utility function to validate settings payload against the schema
 * Returns list of missing required fields if validation fails
 */
export function validateSettingsPayload(payload: Partial<WorkspaceSettingsInsert>): string[] {
  const requiredFields: (keyof WorkspaceSettingsInsert)[] = ['workspace_id', 'workspace_name'];
  const missingFields = requiredFields.filter(field => !payload[field]);
  return missingFields;
}

/**
 * Utility function to validate team member payload against the schema
 * Returns list of missing required fields if validation fails
 */
export function validateTeamMemberPayload(payload: Partial<TeamMemberInsert>): string[] {
  const requiredFields: (keyof TeamMemberInsert)[] = ['workspace_id', 'email', 'role'];
  const missingFields = requiredFields.filter(field => !payload[field]);
  return missingFields;
}
