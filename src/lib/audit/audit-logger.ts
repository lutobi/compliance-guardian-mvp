/**
 * AUDIT LOGGING SYSTEM
 * 
 * Enterprise-grade audit logging for compliance and security
 * Tracks all significant actions within workspaces
 */

import { createWorkspaceScopedClient } from '@/lib/auth/multi-tenant-auth';

export type AuditEventType = 
  // Authentication Events
  | 'auth.login'
  | 'auth.logout' 
  | 'auth.failed_login'
  
  // Workspace Management
  | 'workspace.created'
  | 'workspace.updated'
  | 'workspace.deleted'
  | 'workspace.member_invited'
  | 'workspace.member_joined'
  | 'workspace.member_removed'
  | 'workspace.role_changed'
  
  // Assessment Operations
  | 'assessment.created'
  | 'assessment.updated'
  | 'assessment.deleted'
  | 'assessment.submitted'
  | 'assessment.approved'
  
  // Evidence Management
  | 'evidence.uploaded'
  | 'evidence.updated'
  | 'evidence.deleted'
  | 'evidence.downloaded'
  
  // Reports & Exports
  | 'report.generated'
  | 'report.downloaded'
  | 'data.exported'
  
  // System Events  
  | 'system.backup'
  | 'system.maintenance'
  | 'security.suspicious_activity'
  | 'billing.subscription_changed';

export interface AuditLogEntry {
  id?: string;
  workspace_id: string;
  user_id: string;
  event_type: AuditEventType;
  event_category: 'auth' | 'workspace' | 'assessment' | 'evidence' | 'report' | 'system' | 'security' | 'billing';
  
  // Event Details
  resource_type?: string; // 'assessment', 'evidence', 'workspace', etc.
  resource_id?: string;   // ID of the affected resource
  
  // Context Information
  metadata: {
    ip_address?: string;
    user_agent?: string;
    action_details?: Record<string, any>;
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
  };
  
  // Risk Assessment
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  
  // Timestamps
  created_at?: string;
}

/**
 * Core audit logging service
 */
export class AuditLogger {
  /**
   * Log an audit event
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Get workspace-scoped client for audit logging
      const supabase = createWorkspaceScopedClient(entry.workspace_id);
      
      // Prepare audit log entry
      const auditEntry = {
        ...entry,
        event_category: this.getEventCategory(entry.event_type),
        created_at: new Date().toISOString()
      };
      
      // Insert audit log
      const { error } = await supabase
        .from('audit_logs')
        .insert(auditEntry);
      
      if (error) {
        console.error('Failed to write audit log:', error);
        // Don't throw - audit logging should not break application flow
      }
      
      // For critical events, also log to console/external service
      if (entry.risk_level === 'critical') {
        console.warn('CRITICAL AUDIT EVENT:', {
          workspace_id: entry.workspace_id,
          user_id: entry.user_id,
          event_type: entry.event_type,
          timestamp: auditEntry.created_at
        });
      }
      
    } catch (error) {
      console.error('Audit logging error:', error);
      // Silent fail - don't break application
    }
  }
  
  /**
   * Get event category from event type
   */
  private static getEventCategory(eventType: AuditEventType): AuditLogEntry['event_category'] {
    if (eventType.startsWith('auth.')) return 'auth';
    if (eventType.startsWith('workspace.')) return 'workspace';
    if (eventType.startsWith('assessment.')) return 'assessment';
    if (eventType.startsWith('evidence.')) return 'evidence';
    if (eventType.startsWith('report.') || eventType.startsWith('data.')) return 'report';
    if (eventType.startsWith('billing.')) return 'billing';
    if (eventType.startsWith('security.')) return 'security';
    return 'system';
  }
  
  /**
   * Convenience methods for common audit events
   */
  
  static async logLogin(workspaceId: string, userId: string, metadata: any) {
    await this.log({
      workspace_id: workspaceId,
      user_id: userId,
      event_type: 'auth.login',
      event_category: 'auth',
      metadata,
      risk_level: 'low'
    });
  }
  
  static async logAssessmentCreated(workspaceId: string, userId: string, assessmentId: string, assessmentData: any) {
    await this.log({
      workspace_id: workspaceId,
      user_id: userId,
      event_type: 'assessment.created',
      event_category: 'assessment',
      resource_type: 'assessment',
      resource_id: assessmentId,
      metadata: {
        action_details: assessmentData
      },
      risk_level: 'low'
    });
  }
  
  static async logEvidenceDeleted(workspaceId: string, userId: string, evidenceId: string, evidenceData: any) {
    await this.log({
      workspace_id: workspaceId,
      user_id: userId,
      event_type: 'evidence.deleted',
      event_category: 'evidence',
      resource_type: 'evidence',
      resource_id: evidenceId,
      metadata: {
        action_details: evidenceData
      },
      risk_level: 'medium' // Deletion events are higher risk
    });
  }
  
  static async logWorkspaceRoleChanged(
    workspaceId: string, 
    actorId: string, 
    targetUserId: string, 
    oldRole: string, 
    newRole: string
  ) {
    await this.log({
      workspace_id: workspaceId,
      user_id: actorId,
      event_type: 'workspace.role_changed',
      event_category: 'workspace',
      resource_type: 'user',
      resource_id: targetUserId,
      metadata: {
        old_values: { role: oldRole },
        new_values: { role: newRole }
      },
      risk_level: 'high' // Role changes are security-sensitive
    });
  }
  
  static async logSuspiciousActivity(workspaceId: string, userId: string, details: any) {
    await this.log({
      workspace_id: workspaceId,
      user_id: userId,
      event_type: 'security.suspicious_activity',
      event_category: 'security',
      metadata: {
        action_details: details
      },
      risk_level: 'critical'
    });
  }
}

/**
 * Middleware helper to extract request context for audit logging
 */
export function extractAuditContext(request: any) {
  return {
    ip_address: request.ip || request.headers?.['x-forwarded-for'] || request.headers?.['x-real-ip'],
    user_agent: request.headers?.['user-agent']
  };
}

/**
 * Database schema for audit_logs table (for migration)
 */
export const AUDIT_LOG_SCHEMA = `
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL CHECK (event_category IN ('auth', 'workspace', 'assessment', 'evidence', 'report', 'system', 'security', 'billing')),
  
  resource_type TEXT,
  resource_id TEXT,
  
  metadata JSONB NOT NULL DEFAULT '{}',
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_id ON audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON audit_logs(risk_level);

-- RLS Policy for workspace isolation
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their workspaces"
  ON audit_logs FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND invitation_status = 'active'
    )
  );
`;
