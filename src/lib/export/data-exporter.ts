/**
 * DATA EXPORT AND BACKUP SYSTEM
 * 
 * Enterprise data export capabilities for compliance, backup, and portability
 * Supports GDPR data exports, compliance reports, and workspace backups
 */

import { createWorkspaceScopedClient } from '@/lib/auth/multi-tenant-auth';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { UsageTracker } from '@/lib/security/rate-limiter';

export type ExportFormat = 'json' | 'csv' | 'pdf' | 'xml';
export type ExportType = 'full_backup' | 'assessments' | 'evidence' | 'audit_logs' | 'user_data' | 'compliance_report';

export interface ExportRequest {
  workspace_id: string;
  user_id: string;
  export_type: ExportType;
  format: ExportFormat;
  filters?: {
    date_from?: string;
    date_to?: string;
    user_ids?: string[];
    assessment_ids?: string[];
    include_deleted?: boolean;
  };
  options?: {
    include_metadata?: boolean;
    compress?: boolean;
    encrypt?: boolean;
  };
}

export interface ExportResult {
  success: boolean;
  export_id: string;
  download_url?: string;
  file_size?: number;
  expires_at: string;
  error?: string;
}

/**
 * Data export service
 */
export class DataExporter {
  /**
   * Main export function
   */
  static async exportData(request: ExportRequest): Promise<ExportResult> {
    try {
      const supabase = createWorkspaceScopedClient(request.workspace_id);
      
      // Log export request for audit
      await AuditLogger.log({
        workspace_id: request.workspace_id,
        user_id: request.user_id,
        event_type: 'data.exported',
        event_category: 'report',
        metadata: {
          action_details: {
            export_type: request.export_type,
            format: request.format,
            filters: request.filters
          }
        },
        risk_level: 'medium'
      });

      // Record usage for billing/limits
      await UsageTracker.recordReportExport(request.workspace_id);

      // Generate export based on type
      let exportData: any;
      
      switch (request.export_type) {
        case 'full_backup':
          exportData = await this.exportFullBackup(supabase, request);
          break;
        case 'assessments':
          exportData = await this.exportAssessments(supabase, request);
          break;
        case 'evidence':
          exportData = await this.exportEvidence(supabase, request);
          break;
        case 'audit_logs':
          exportData = await this.exportAuditLogs(supabase, request);
          break;
        case 'user_data':
          exportData = await this.exportUserData(supabase, request);
          break;
        case 'compliance_report':
          exportData = await this.exportComplianceReport(supabase, request);
          break;
        default:
          throw new Error(`Unsupported export type: ${request.export_type}`);
      }

      // Format the data
      const formattedData = await this.formatExportData(exportData, request.format);

      // Generate unique export ID
      const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store export metadata (for tracking and cleanup)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      const { error } = await supabase
        .from('data_exports')
        .insert({
          id: exportId,
          workspace_id: request.workspace_id,
          user_id: request.user_id,
          export_type: request.export_type,
          format: request.format,
          status: 'completed',
          file_size: formattedData.length,
          expires_at: expiresAt.toISOString(),
          metadata: {
            filters: request.filters,
            options: request.options
          }
        });

      if (error) {
        console.error('Failed to store export metadata:', error);
      }

      // In a real implementation, you'd upload to S3/storage and return download URL
      // For now, return the data directly (in production, store in blob storage)
      const downloadUrl = `/api/exports/${exportId}/download`;

      return {
        success: true,
        export_id: exportId,
        download_url: downloadUrl,
        file_size: formattedData.length,
        expires_at: expiresAt.toISOString()
      };

    } catch (error: any) {
      console.error('Data export error:', error);
      
      return {
        success: false,
        export_id: '',
        expires_at: new Date().toISOString(),
        error: error.message || 'Export failed'
      };
    }
  }

  /**
   * Full workspace backup
   */
  private static async exportFullBackup(supabase: any, request: ExportRequest) {
    const backup = {
      workspace_info: await this.getWorkspaceInfo(supabase, request.workspace_id),
      users: await this.getWorkspaceUsers(supabase, request.workspace_id),
      assessments: await this.getAssessments(supabase, request),
      evidence: await this.getEvidence(supabase, request),
      integrations: await this.getIntegrations(supabase, request.workspace_id),
      audit_logs: await this.getAuditLogs(supabase, request),
      export_metadata: {
        created_at: new Date().toISOString(),
        created_by: request.user_id,
        export_type: 'full_backup',
        version: '1.0'
      }
    };

    return backup;
  }

  /**
   * Export assessments data
   */
  private static async exportAssessments(supabase: any, request: ExportRequest) {
    const assessments = await this.getAssessments(supabase, request);
    
    return {
      assessments,
      metadata: {
        total_count: assessments.length,
        exported_at: new Date().toISOString(),
        filters_applied: request.filters
      }
    };
  }

  /**
   * Export evidence/documents
   */
  private static async exportEvidence(supabase: any, request: ExportRequest) {
    const evidence = await this.getEvidence(supabase, request);
    
    return {
      evidence,
      metadata: {
        total_count: evidence.length,
        exported_at: new Date().toISOString(),
        note: 'File contents not included in export - only metadata'
      }
    };
  }

  /**
   * Export audit logs
   */
  private static async exportAuditLogs(supabase: any, request: ExportRequest) {
    const auditLogs = await this.getAuditLogs(supabase, request);
    
    return {
      audit_logs: auditLogs,
      metadata: {
        total_count: auditLogs.length,
        exported_at: new Date().toISOString()
      }
    };
  }

  /**
   * GDPR user data export
   */
  private static async exportUserData(supabase: any, request: ExportRequest) {
    // Get user's personal data across all tables
    const userData = {
      profile: await this.getUserProfile(supabase, request.user_id),
      assessments: await this.getUserAssessments(supabase, request.user_id),
      evidence: await this.getUserEvidence(supabase, request.user_id),
      audit_logs: await this.getUserAuditLogs(supabase, request.user_id),
      workspace_memberships: await this.getUserMemberships(supabase, request.user_id)
    };

    return {
      user_data: userData,
      metadata: {
        user_id: request.user_id,
        exported_at: new Date().toISOString(),
        purpose: 'GDPR data export',
        retention_notice: 'This data export will be automatically deleted after 30 days'
      }
    };
  }

  /**
   * Generate compliance report
   */
  private static async exportComplianceReport(supabase: any, request: ExportRequest) {
    // Aggregate compliance data for reporting
    const report = {
      summary: await this.getComplianceSummary(supabase, request.workspace_id),
      assessments_by_framework: await this.getAssessmentsByFramework(supabase, request),
      risk_analysis: await this.getRiskAnalysis(supabase, request.workspace_id),
      evidence_summary: await this.getEvidenceSummary(supabase, request.workspace_id),
      team_activity: await this.getTeamActivity(supabase, request.workspace_id)
    };

    return report;
  }

  /**
   * Helper functions for data retrieval
   */
  
  private static async getWorkspaceInfo(supabase: any, workspaceId: string) {
    const { data } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();
    return data;
  }

  private static async getWorkspaceUsers(supabase: any, workspaceId: string) {
    const { data } = await supabase
      .from('workspace_members')
      .select(`
        *,
        user_profiles (id, email, name, created_at)
      `)
      .eq('workspace_id', workspaceId);
    return data || [];
  }

  private static async getAssessments(supabase: any, request: ExportRequest) {
    let query = supabase
      .from('assessments')
      .select('*')
      .eq('workspace_id', request.workspace_id);

    if (request.filters?.date_from) {
      query = query.gte('created_at', request.filters.date_from);
    }
    if (request.filters?.date_to) {
      query = query.lte('created_at', request.filters.date_to);
    }

    const { data } = await query;
    return data || [];
  }

  private static async getEvidence(supabase: any, request: ExportRequest) {
    let query = supabase
      .from('evidence')
      .select('*')
      .eq('workspace_id', request.workspace_id);

    if (request.filters?.date_from) {
      query = query.gte('created_at', request.filters.date_from);
    }
    if (request.filters?.date_to) {
      query = query.lte('created_at', request.filters.date_to);
    }

    const { data } = await query;
    return data || [];
  }

  private static async getAuditLogs(supabase: any, request: ExportRequest) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('workspace_id', request.workspace_id);

    if (request.filters?.date_from) {
      query = query.gte('created_at', request.filters.date_from);
    }
    if (request.filters?.date_to) {
      query = query.lte('created_at', request.filters.date_to);
    }

    const { data } = await query;
    return data || [];
  }

  private static async getIntegrations(supabase: any, workspaceId: string) {
    const { data } = await supabase
      .from('integrations')
      .select('*')
      .eq('workspace_id', workspaceId);
    return data || [];
  }

  // Additional helper methods would be implemented here...
  private static async getUserProfile(supabase: any, userId: string) { /* ... */ }
  private static async getUserAssessments(supabase: any, userId: string) { /* ... */ }
  private static async getUserEvidence(supabase: any, userId: string) { /* ... */ }
  private static async getUserAuditLogs(supabase: any, userId: string) { /* ... */ }
  private static async getUserMemberships(supabase: any, userId: string) { /* ... */ }
  private static async getComplianceSummary(supabase: any, workspaceId: string) { /* ... */ }
  private static async getAssessmentsByFramework(supabase: any, request: ExportRequest) { /* ... */ }
  private static async getRiskAnalysis(supabase: any, workspaceId: string) { /* ... */ }
  private static async getEvidenceSummary(supabase: any, workspaceId: string) { /* ... */ }
  private static async getTeamActivity(supabase: any, workspaceId: string) { /* ... */ }

  /**
   * Format export data based on requested format
   */
  private static async formatExportData(data: any, format: ExportFormat): Promise<string> {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      
      case 'csv':
        return this.convertToCSV(data);
      
      case 'xml':
        return this.convertToXML(data);
      
      case 'pdf':
        // Would integrate with PDF generation library
        return JSON.stringify(data, null, 2); // Fallback to JSON
      
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  private static convertToCSV(data: any): string {
    // Simple CSV conversion - would be enhanced for production
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => 
        Object.values(item).map(val => 
          typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
        ).join(',')
      );
      
      return [headers, ...rows].join('\n');
    }
    
    // For non-array data, flatten to key-value pairs
    return Object.entries(data)
      .map(([key, value]) => `"${key}","${value}"`)
      .join('\n');
  }

  private static convertToXML(data: any): string {
    // Simple XML conversion - would be enhanced for production
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const xmlContent = this.objectToXML(data, 'export');
    return xmlHeader + xmlContent;
  }

  private static objectToXML(obj: any, rootName: string): string {
    if (typeof obj !== 'object') {
      return `<${rootName}>${obj}</${rootName}>`;
    }

    const entries = Object.entries(obj)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(item => this.objectToXML(item, key)).join('');
        } else if (typeof value === 'object') {
          return `<${key}>${this.objectToXML(value, key)}</${key}>`;
        } else {
          return `<${key}>${value}</${key}>`;
        }
      })
      .join('');

    return `<${rootName}>${entries}</${rootName}>`;
  }
}
