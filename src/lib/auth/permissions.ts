/**
 * CENTRALIZED PERMISSION SYSTEM
 * 
 * Defines all permissions and role-based access control
 * for the multi-tenant application
 */

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export type Permission = 
  // Dashboard & Analytics
  | 'view_dashboard'
  | 'manage_dashboard'
  
  // Assessments
  | 'view_assessments' 
  | 'create_assessments'
  | 'edit_assessments'
  | 'delete_assessments'
  
  // Evidence & Documents
  | 'view_evidence'
  | 'create_evidence'
  | 'edit_evidence'
  | 'delete_evidence'
  
  // Reports
  | 'view_reports'
  | 'create_reports'
  | 'export_reports'
  
  // Monitoring
  | 'view_monitoring'
  | 'manage_monitoring'
  | 'configure_alerts'
  
  // Integrations
  | 'view_integrations'
  | 'manage_integrations'
  | 'configure_integrations'
  
  // Team Management
  | 'view_team'
  | 'invite_members'
  | 'manage_team'
  | 'remove_members'
  
  // Billing & Subscription
  | 'view_billing'
  | 'manage_billing'
  | 'view_usage'
  
  // Workspace Settings
  | 'view_settings'
  | 'manage_settings'
  | 'delete_workspace';

/**
 * Role-based permission mapping
 * Defines what each role can do in a workspace
 */
export const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  owner: [
    // Full access to everything
    'view_dashboard', 'manage_dashboard',
    'view_assessments', 'create_assessments', 'edit_assessments', 'delete_assessments',
    'view_evidence', 'create_evidence', 'edit_evidence', 'delete_evidence',
    'view_reports', 'create_reports', 'export_reports',
    'view_monitoring', 'manage_monitoring', 'configure_alerts',
    'view_integrations', 'manage_integrations', 'configure_integrations',
    'view_team', 'invite_members', 'manage_team', 'remove_members',
    'view_billing', 'manage_billing', 'view_usage',
    'view_settings', 'manage_settings', 'delete_workspace'
  ],
  
  admin: [
    // Administrative access but cannot delete workspace or manage billing
    'view_dashboard', 'manage_dashboard',
    'view_assessments', 'create_assessments', 'edit_assessments', 'delete_assessments',
    'view_evidence', 'create_evidence', 'edit_evidence', 'delete_evidence',
    'view_reports', 'create_reports', 'export_reports',
    'view_monitoring', 'manage_monitoring', 'configure_alerts',
    'view_integrations', 'manage_integrations', 'configure_integrations',
    'view_team', 'invite_members', 'manage_team', 'remove_members',
    'view_billing', 'view_usage',
    'view_settings', 'manage_settings'
  ],
  
  editor: [
    // Can create and edit content but limited admin functions
    'view_dashboard',
    'view_assessments', 'create_assessments', 'edit_assessments',
    'view_evidence', 'create_evidence', 'edit_evidence',
    'view_reports', 'create_reports', 'export_reports',
    'view_monitoring',
    'view_integrations',
    'view_team',
    'view_billing', 'view_usage',
    'view_settings'
  ],
  
  viewer: [
    // Read-only access
    'view_dashboard',
    'view_assessments',
    'view_evidence',
    'view_reports', 'export_reports',
    'view_monitoring',
    'view_integrations',
    'view_team',
    'view_billing', 'view_usage',
    'view_settings'
  ]
};

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: WorkspaceRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: WorkspaceRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if a permission requires ownership of a resource
 * (e.g., only resource creator can edit their own evidence)
 */
export function requiresOwnership(permission: Permission): boolean {
  const ownershipRequiredPermissions: Permission[] = [
    'edit_evidence',
    'delete_evidence'
  ];
  
  return ownershipRequiredPermissions.includes(permission);
}

/**
 * Permission validation utility
 */
export function validatePermission(permission: string): permission is Permission {
  const allPermissions = Object.values(ROLE_PERMISSIONS).flat();
  return allPermissions.includes(permission as Permission);
}
