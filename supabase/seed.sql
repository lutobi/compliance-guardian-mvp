-- Create tables
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    settings JSONB DEFAULT '{}'::JSONB,
    branding JSONB DEFAULT '{}'::JSONB
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    tier TEXT NOT NULL,
    features JSONB NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active',
    UNIQUE(customer_id)
);

CREATE TABLE compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT,
    controls JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE TABLE customer_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    framework_id UUID REFERENCES compliance_frameworks(id),
    enabled BOOLEAN DEFAULT true,
    custom_controls JSONB DEFAULT '[]'::JSONB,
    control_overrides JSONB DEFAULT '{}'::JSONB,
    mappings JSONB DEFAULT '{}'::JSONB,
    UNIQUE(customer_id, framework_id)
);

CREATE TABLE custom_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    config JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE TABLE module_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES custom_modules(id),
    customer_id UUID REFERENCES customers(id),
    config JSONB DEFAULT '{}'::JSONB,
    status TEXT DEFAULT 'active',
    error TEXT,
    UNIQUE(module_id, customer_id)
);

-- Insert sample data
-- Sample Customer
INSERT INTO customers (id, name, industry, settings, branding) VALUES
(
    '12345678-1234-5678-1234-567812345678',
    'Acme Corp',
    'Technology',
    '{
        "features": {
            "enabledModules": ["compliance", "risk"],
            "customizations": {}
        },
        "compliance": {
            "frameworks": ["iso27001", "gdpr"],
            "customControls": []
        },
        "notifications": {
            "email": true,
            "slack": true
        }
    }'::JSONB,
    '{
        "logo": "https://example.com/logo.png",
        "colors": {
            "primary": "#0066cc",
            "secondary": "#4d4d4d",
            "accent": "#00cc99"
        }
    }'::JSONB
);

-- Sample Subscription
INSERT INTO subscriptions (customer_id, tier, features) VALUES
(
    '12345678-1234-5678-1234-567812345678',
    'professional',
    '{
        "maxUsers": 20,
        "maxWorkspaces": 3,
        "customBranding": true,
        "customFrameworks": false,
        "apiAccess": true,
        "advancedAnalytics": true,
        "supportLevel": "priority",
        "retentionPeriod": 90
    }'::JSONB
);

-- Sample Framework
INSERT INTO compliance_frameworks (id, name, version, description, controls, metadata) VALUES
(
    '87654321-4321-8765-4321-876543210987',
    'ISO 27001',
    '2022',
    'Information Security Management System',
    '[
        {
            "id": "A.5.1.1",
            "code": "ISM-01",
            "title": "Information Security Policies",
            "description": "Management should define a set of policies for information security",
            "requirements": ["Policy documentation", "Annual review"],
            "risk_level": "high",
            "verification_method": "manual"
        }
    ]'::JSONB,
    '{
        "industry": ["Technology", "Finance"],
        "region": ["Global"],
        "type": "standard"
    }'::JSONB
);

-- Link Framework to Customer
INSERT INTO customer_frameworks (customer_id, framework_id, enabled, custom_controls, control_overrides) VALUES
(
    '12345678-1234-5678-1234-567812345678',
    '87654321-4321-8765-4321-876543210987',
    true,
    '[]'::JSONB,
    '{
        "A.5.1.1": {
            "requirements": ["Policy documentation", "Quarterly review", "Staff training"],
            "risk_level": "medium"
        }
    }'::JSONB
);

-- Sample Custom Module
INSERT INTO custom_modules (id, name, description, type, config, metadata) VALUES
(
    'abcdef12-3456-7890-abcd-ef1234567890',
    'Supply Chain Risk Assessment',
    'Custom risk assessment for supply chain management',
    'risk',
    '{
        "components": {
            "main": "SupplyChainRisk",
            "dashboard": "SupplyChainDashboard"
        },
        "schema": {
            "suppliers": {
                "name": "string",
                "risk_score": "number",
                "categories": "array"
            }
        }
    }'::JSONB,
    '{
        "version": "1.0.0",
        "author": "Compliance Guardian",
        "createdAt": "2025-01-01T00:00:00Z"
    }'::JSONB
);

-- Link Module to Customer
INSERT INTO module_instances (module_id, customer_id, config, status) VALUES
(
    'abcdef12-3456-7890-abcd-ef1234567890',
    '12345678-1234-5678-1234-567812345678',
    '{
        "enabledFeatures": ["risk_scoring", "supplier_management"],
        "thresholds": {
            "high_risk": 80,
            "medium_risk": 50
        }
    }'::JSONB,
    'active'
);
