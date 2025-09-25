-- COMPLIANCE GUARDIAN MVP - COMPLETE MULTI-TENANT SCHEMA REDESIGN
-- This script completely rebuilds the database for proper multi-tenancy
-- WARNING: This will require data migration from existing tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE MULTI-TENANT ARCHITECTURE
-- ============================================================================

-- 1. WORKSPACES (Tenant Isolation Boundary)
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier (acme-corp)
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('system', 'customer')),
    
    -- Subscription & Billing
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'suspended')),
    
    -- Ownership & Contact
    owner_id UUID, -- References auth.users(id), set after user profiles created
    billing_email TEXT,
    
    -- Configuration
    settings JSONB NOT NULL DEFAULT '{}',
    features JSONB NOT NULL DEFAULT '[]', -- Enabled features for this workspace
    limits JSONB NOT NULL DEFAULT '{}', -- Usage limits based on tier
    
    -- Metadata
    industry TEXT,
    company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ NULL
);

-- 2. USER PROFILES (Global User Identity)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY, -- References auth.users(id)
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    
    -- User Preferences
    default_workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    timezone TEXT DEFAULT 'UTC',
    locale TEXT DEFAULT 'en-US',
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    
    -- Settings & Metadata
    settings JSONB NOT NULL DEFAULT '{}',
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_active_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. WORKSPACE MEMBERSHIPS (Many-to-Many User-Workspace Relationship)
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Role & Permissions
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    permissions JSONB NOT NULL DEFAULT '[]', -- Custom permissions
    
    -- Invitation & Status
    invitation_status TEXT NOT NULL DEFAULT 'active' CHECK (invitation_status IN ('pending', 'active', 'suspended', 'declined')),
    invited_by UUID REFERENCES user_profiles(id),
    invitation_token TEXT UNIQUE, -- For pending invitations
    invitation_expires_at TIMESTAMPTZ,
    
    -- Timestamps
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    
    -- Constraints
    UNIQUE(workspace_id, user_id)
);

-- 4. INVITATION TOKENS (Separate table for better management)
CREATE TABLE workspace_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    
    -- Invitation metadata
    invited_by UUID NOT NULL REFERENCES user_profiles(id),
    message TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    accepted_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(workspace_id, email)
);

-- ============================================================================
-- SUBSCRIPTION & BILLING
-- ============================================================================

-- 5. SUBSCRIPTIONS
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    -- Subscription Details
    plan_id TEXT NOT NULL, -- starter, pro, enterprise
    status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
    
    -- Billing Periods
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    
    -- External IDs (Stripe, etc.)
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    
    -- Pricing
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    canceled_at TIMESTAMPTZ,
    
    -- Constraints
    UNIQUE(workspace_id) -- One subscription per workspace
);

-- 6. USAGE TRACKING
CREATE TABLE usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    -- Metric Details
    metric_type TEXT NOT NULL, -- api_calls, storage_mb, assessments, users, etc.
    value INTEGER NOT NULL DEFAULT 0,
    
    -- Time Period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Timestamps
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(workspace_id, metric_type, period_start)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Workspace indexes
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_workspaces_subscription_status ON workspaces(subscription_status);
CREATE INDEX idx_workspaces_deleted_at ON workspaces(deleted_at) WHERE deleted_at IS NULL;

-- User profile indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_default_workspace ON user_profiles(default_workspace_id);

-- Workspace member indexes
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_role ON workspace_members(role);
CREATE INDEX idx_workspace_members_status ON workspace_members(invitation_status);

-- Invitation indexes
CREATE INDEX idx_invitations_workspace_id ON workspace_invitations(workspace_id);
CREATE INDEX idx_invitations_email ON workspace_invitations(email);
CREATE INDEX idx_invitations_token ON workspace_invitations(token);
CREATE INDEX idx_invitations_expires_at ON workspace_invitations(expires_at);

-- Usage tracking indexes
CREATE INDEX idx_usage_metrics_workspace_id ON usage_metrics(workspace_id);
CREATE INDEX idx_usage_metrics_type_period ON usage_metrics(metric_type, period_start, period_end);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- Workspace RLS Policies
CREATE POLICY "Users can view workspaces they are members of"
    ON workspaces FOR SELECT
    USING (
        id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND invitation_status = 'active'
        )
    );

CREATE POLICY "Workspace owners and admins can update workspace"
    ON workspaces FOR UPDATE
    USING (
        id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND invitation_status = 'active'
        )
    );

-- User Profile RLS Policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (id = auth.uid());

-- Workspace Member RLS Policies
CREATE POLICY "Users can view members of their workspaces"
    ON workspace_members FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND invitation_status = 'active'
        )
    );

CREATE POLICY "Workspace admins can manage members"
    ON workspace_members FOR ALL
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND invitation_status = 'active'
        )
    );

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON workspace_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS FOR WORKSPACE MANAGEMENT
-- ============================================================================

-- Function to create a new workspace with owner
CREATE OR REPLACE FUNCTION create_workspace_with_owner(
    p_user_id UUID,
    p_workspace_name TEXT,
    p_workspace_slug TEXT,
    p_industry TEXT DEFAULT NULL,
    p_company_size TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_workspace_id UUID;
BEGIN
    -- Create workspace
    INSERT INTO workspaces (slug, name, type, owner_id, industry, company_size)
    VALUES (p_workspace_slug, p_workspace_name, 'customer', p_user_id, p_industry, p_company_size)
    RETURNING id INTO v_workspace_id;
    
    -- Add user as owner
    INSERT INTO workspace_members (workspace_id, user_id, role, invitation_status, joined_at)
    VALUES (v_workspace_id, p_user_id, 'owner', 'active', NOW());
    
    -- Set as user's default workspace if they don't have one
    UPDATE user_profiles 
    SET default_workspace_id = v_workspace_id
    WHERE id = p_user_id AND default_workspace_id IS NULL;
    
    RETURN v_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invite user to workspace
CREATE OR REPLACE FUNCTION invite_user_to_workspace(
    p_workspace_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_invited_by UUID,
    p_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_invitation_id UUID;
    v_existing_user_id UUID;
BEGIN
    -- Check if user already exists
    SELECT id INTO v_existing_user_id 
    FROM user_profiles 
    WHERE email = p_email;
    
    -- Create invitation
    INSERT INTO workspace_invitations (workspace_id, email, role, invited_by, message)
    VALUES (p_workspace_id, p_email, p_role, p_invited_by, p_message)
    RETURNING id INTO v_invitation_id;
    
    -- If user exists, also create pending membership
    IF v_existing_user_id IS NOT NULL THEN
        INSERT INTO workspace_members (workspace_id, user_id, role, invitation_status, invited_by)
        VALUES (p_workspace_id, v_existing_user_id, p_role, 'pending', p_invited_by)
        ON CONFLICT (workspace_id, user_id) DO NOTHING;
    END IF;
    
    RETURN v_invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DATA MIGRATION PREPARATION
-- ============================================================================

-- This will be used to migrate existing data
-- NOTE: Actual migration will be in separate scripts
