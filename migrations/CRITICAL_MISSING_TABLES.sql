-- ============================================================================
-- CRITICAL MISSING BUSINESS TABLES FOR MULTI-TENANT ARCHITECTURE
-- ============================================================================
-- These tables are REQUIRED but missing from MASTER_SCHEMA_REDESIGN.sql

-- ============================================================================
-- ASSESSMENTS TABLE (Core Business Entity)
-- ============================================================================
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    
    -- Assessment Content
    title TEXT NOT NULL,
    description TEXT,
    framework_id TEXT NOT NULL,
    control_id TEXT,
    
    -- Status & Progress
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'approved', 'rejected')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Assessment Data
    assessment_data JSONB DEFAULT '{}',
    responses JSONB DEFAULT '{}',
    scores JSONB DEFAULT '{}',
    
    -- Metadata
    scope TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    due_date TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES user_profiles(id)
);

-- ============================================================================
-- EVIDENCE TABLE (Fixed for Multi-Tenancy)
-- ============================================================================
DROP TABLE IF EXISTS public.evidence CASCADE;

CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    
    -- Evidence Content
    title TEXT NOT NULL,
    description TEXT,
    framework_id TEXT NOT NULL,
    control_id TEXT,
    subcontrol_id TEXT,
    
    -- File Management
    files JSONB DEFAULT '[]',
    file_paths TEXT[],
    file_types TEXT[],
    total_file_size BIGINT DEFAULT 0,
    
    -- Content & Analysis
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    extracted_text TEXT, -- OCR/parsed content
    metadata JSONB DEFAULT '{}',
    
    -- Status & Validation
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'failed')),
    
    -- Linking
    assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES user_profiles(id)
);

-- ============================================================================
-- FRAMEWORKS TABLE (Compliance Frameworks)
-- ============================================================================
CREATE TABLE frameworks (
    id TEXT PRIMARY KEY, -- e.g., 'iso27001', 'soc2', 'gdpr'
    name TEXT NOT NULL,
    version TEXT,
    description TEXT,
    
    -- Framework Structure
    categories JSONB DEFAULT '[]',
    controls JSONB DEFAULT '[]',
    requirements JSONB DEFAULT '[]',
    
    -- Metadata
    industry TEXT[],
    region TEXT[],
    type TEXT CHECK (type IN ('standard', 'regulation', 'framework', 'guideline')),
    
    -- Status
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INTEGRATIONS TABLE (External System Connections)
-- ============================================================================
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id), -- Creator
    
    -- Integration Details
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'aws', 'azure', 'gcp', 'slack', 'jira', etc.
    description TEXT,
    
    -- Configuration
    config JSONB DEFAULT '{}', -- Encrypted configuration
    credentials_encrypted TEXT, -- Encrypted credentials
    endpoint_url TEXT,
    
    -- Status & Health
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
    last_sync_at TIMESTAMPTZ,
    last_error TEXT,
    sync_frequency TEXT, -- 'hourly', 'daily', 'weekly', 'manual'
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- ============================================================================
-- REPORTS TABLE (Generated Reports)
-- ============================================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id), -- Generator
    
    -- Report Details
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('assessment', 'compliance', 'risk', 'audit', 'custom')),
    format TEXT NOT NULL CHECK (format IN ('pdf', 'html', 'json', 'csv', 'excel')),
    
    -- Content & Filters
    filters JSONB DEFAULT '{}',
    parameters JSONB DEFAULT '{}',
    content_summary TEXT,
    
    -- File Management
    file_path TEXT,
    file_size BIGINT,
    download_count INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed', 'expired')),
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ, -- Auto-delete after period
    last_downloaded_at TIMESTAMPTZ
);

-- ============================================================================
-- MISSING TABLES FOR NEW INFRASTRUCTURE
-- ============================================================================

-- Data Exports Table (for data-exporter.ts)
CREATE TABLE data_exports (
    id TEXT PRIMARY KEY, -- export_timestamp_random
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    
    export_type TEXT NOT NULL,
    format TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
    
    file_path TEXT,
    file_size BIGINT,
    download_count INTEGER DEFAULT 0,
    
    metadata JSONB DEFAULT '{}',
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    last_downloaded_at TIMESTAMPTZ
);

-- Audit Logs Table (for audit-logger.ts)
CREATE TABLE audit_logs (
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

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Assessment indexes
CREATE INDEX idx_assessments_workspace_id ON assessments(workspace_id);
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_framework_id ON assessments(framework_id);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);

-- Evidence indexes
CREATE INDEX idx_evidence_workspace_id ON evidence(workspace_id);
CREATE INDEX idx_evidence_user_id ON evidence(user_id);
CREATE INDEX idx_evidence_assessment_id ON evidence(assessment_id);
CREATE INDEX idx_evidence_framework_id ON evidence(framework_id);
CREATE INDEX idx_evidence_status ON evidence(status);
CREATE INDEX idx_evidence_created_at ON evidence(created_at DESC);

-- Integration indexes
CREATE INDEX idx_integrations_workspace_id ON integrations(workspace_id);
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_status ON integrations(status);

-- Report indexes
CREATE INDEX idx_reports_workspace_id ON reports(workspace_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Export indexes
CREATE INDEX idx_data_exports_workspace_id ON data_exports(workspace_id);
CREATE INDEX idx_data_exports_user_id ON data_exports(user_id);
CREATE INDEX idx_data_exports_expires_at ON data_exports(expires_at);

-- Audit log indexes
CREATE INDEX idx_audit_logs_workspace_id ON audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_risk_level ON audit_logs(risk_level);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Assessment RLS policies
CREATE POLICY "Users can view assessments in their workspaces"
    ON assessments FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND invitation_status = 'active'
        )
    );

CREATE POLICY "Users can create assessments in their workspaces"
    ON assessments FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND invitation_status = 'active'
        )
    );

CREATE POLICY "Assessment creators and admins can update"
    ON assessments FOR UPDATE
    USING (
        user_id = auth.uid() OR 
        workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND invitation_status = 'active'
        )
    );

-- Evidence RLS policies
CREATE POLICY "Users can view evidence in their workspaces"
    ON evidence FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND invitation_status = 'active'
        )
    );

CREATE POLICY "Users can create evidence in their workspaces"
    ON evidence FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND invitation_status = 'active'
        )
    );

-- Framework RLS policy (public read)
CREATE POLICY "Frameworks are publicly readable"
    ON frameworks FOR SELECT
    USING (active = true);

-- Integration RLS policies
CREATE POLICY "Users can view integrations in their workspaces"
    ON integrations FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND invitation_status = 'active'
        )
    );

-- Report RLS policies
CREATE POLICY "Users can view reports in their workspaces"
    ON reports FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND invitation_status = 'active'
        )
    );

-- Export RLS policies
CREATE POLICY "Users can view their own exports"
    ON data_exports FOR SELECT
    USING (
        user_id = auth.uid() OR 
        workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND invitation_status = 'active'
        )
    );

-- Audit log RLS policies
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

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update timestamp triggers
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evidence_updated_at BEFORE UPDATE ON evidence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frameworks_updated_at BEFORE UPDATE ON frameworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
