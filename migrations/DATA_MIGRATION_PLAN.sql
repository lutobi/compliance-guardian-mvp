-- DATA MIGRATION PLAN - SINGLE-TENANT TO MULTI-TENANT
-- This script safely migrates existing data to the new multi-tenant structure
-- CRITICAL: Run in transaction with rollback points

BEGIN;

-- ============================================================================
-- PHASE 1: CREATE STAGING TABLES FOR SAFE MIGRATION
-- ============================================================================

-- Backup existing tables
CREATE TABLE backup_users AS SELECT * FROM users;
CREATE TABLE backup_workspaces AS SELECT * FROM workspaces;
CREATE TABLE backup_customers AS SELECT * FROM customers;
CREATE TABLE backup_assessments AS SELECT * FROM assessments;

-- Create migration tracking table
CREATE TABLE migration_log (
    id SERIAL PRIMARY KEY,
    phase TEXT NOT NULL,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    records_affected INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PHASE 2: MIGRATE CORE DATA WITH WORKSPACE ISOLATION
-- ============================================================================

-- Step 1: Create default system workspace
INSERT INTO workspaces (id, slug, name, type, subscription_tier, owner_id)
VALUES (
    uuid_generate_v4(),
    'system-admin',
    'System Administration',
    'system',
    'enterprise',
    NULL  -- Will be set after user migration
) ON CONFLICT DO NOTHING;

-- Log migration step
INSERT INTO migration_log (phase, table_name, operation, records_affected, success)
VALUES ('PHASE_2', 'workspaces', 'CREATE_SYSTEM_WORKSPACE', 1, TRUE);

-- Step 2: Migrate existing workspaces to new structure
WITH workspace_migration AS (
    INSERT INTO workspaces (
        id,
        slug,
        name,
        type,
        subscription_tier,
        settings,
        created_at,
        updated_at
    )
    SELECT 
        w.id,
        LOWER(REGEXP_REPLACE(w.name, '[^a-zA-Z0-9]+', '-', 'g')) as slug,
        w.name,
        COALESCE(w.type, 'customer'),
        'free', -- Default tier for existing workspaces
        COALESCE(w.context, '{}'),
        COALESCE(w.created_at, NOW()),
        COALESCE(w.updated_at, NOW())
    FROM backup_workspaces w
    WHERE w.type = 'customer'
    ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        updated_at = NOW()
    RETURNING id
)
INSERT INTO migration_log (phase, table_name, operation, records_affected, success)
SELECT 'PHASE_2', 'workspaces', 'MIGRATE_EXISTING', COUNT(*), TRUE
FROM workspace_migration;

-- Step 3: Migrate user profiles
WITH user_migration AS (
    INSERT INTO user_profiles (
        id,
        email,
        name,
        default_workspace_id,
        created_at,
        updated_at
    )
    SELECT 
        u.id,
        u.email,
        u.name,
        u.workspace_id, -- This becomes their default workspace
        COALESCE(u.created_at, NOW()),
        COALESCE(u.updated_at, NOW())
    FROM backup_users u
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        default_workspace_id = EXCLUDED.default_workspace_id,
        updated_at = NOW()
    RETURNING id
)
INSERT INTO migration_log (phase, table_name, operation, records_affected, success)
SELECT 'PHASE_2', 'user_profiles', 'MIGRATE_USERS', COUNT(*), TRUE
FROM user_migration;

-- Step 4: Create workspace memberships based on existing user-workspace relationships
WITH membership_migration AS (
    INSERT INTO workspace_members (
        workspace_id,
        user_id,
        role,
        invitation_status,
        joined_at
    )
    SELECT 
        u.workspace_id,
        u.id,
        CASE 
            WHEN r.capabilities->>'type' = 'system' THEN 'admin'
            WHEN r.capabilities->'access' ? 'admin' THEN 'admin'
            WHEN r.capabilities->'access' ? 'edit' THEN 'editor'
            ELSE 'viewer'
        END as role,
        'active',
        COALESCE(u.created_at, NOW())
    FROM backup_users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.workspace_id IS NOT NULL
    ON CONFLICT (workspace_id, user_id) DO UPDATE SET
        role = EXCLUDED.role,
        invitation_status = 'active'
    RETURNING id
)
INSERT INTO migration_log (phase, table_name, operation, records_affected, success)
SELECT 'PHASE_2', 'workspace_members', 'CREATE_MEMBERSHIPS', COUNT(*), TRUE
FROM membership_migration;

-- ============================================================================
-- PHASE 3: UPDATE WORKSPACE OWNERSHIP
-- ============================================================================

-- Set workspace owners (first admin/owner user for each workspace)
WITH workspace_owners AS (
    UPDATE workspaces 
    SET owner_id = (
        SELECT wm.user_id 
        FROM workspace_members wm 
        WHERE wm.workspace_id = workspaces.id 
        AND wm.role IN ('owner', 'admin')
        AND wm.invitation_status = 'active'
        ORDER BY wm.joined_at ASC 
        LIMIT 1
    )
    WHERE owner_id IS NULL
    RETURNING id
)
INSERT INTO migration_log (phase, table_name, operation, records_affected, success)
SELECT 'PHASE_3', 'workspaces', 'SET_OWNERS', COUNT(*), TRUE
FROM workspace_owners;

-- ============================================================================
-- PHASE 4: MIGRATE BUSINESS DATA WITH WORKSPACE_ID
-- ============================================================================

-- Update assessments table to include workspace_id if not already present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'assessments' AND column_name = 'workspace_id') THEN
        ALTER TABLE assessments ADD COLUMN workspace_id UUID REFERENCES workspaces(id);
    END IF;
END $$;

-- Populate workspace_id for existing assessments
WITH assessment_migration AS (
    UPDATE assessments 
    SET workspace_id = u.workspace_id
    FROM backup_users u
    WHERE assessments.created_by = u.id
    AND assessments.workspace_id IS NULL
    RETURNING assessments.id
)
INSERT INTO migration_log (phase, table_name, operation, records_affected, success)
SELECT 'PHASE_4', 'assessments', 'ADD_WORKSPACE_CONTEXT', COUNT(*), TRUE
FROM assessment_migration;

-- ============================================================================
-- PHASE 5: CREATE DEFAULT SUBSCRIPTIONS
-- ============================================================================

-- Create free subscriptions for all customer workspaces
WITH subscription_creation AS (
    INSERT INTO subscriptions (
        workspace_id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        amount,
        currency
    )
    SELECT 
        w.id,
        'free',
        'active',
        NOW(),
        NOW() + INTERVAL '1 year', -- Free plan doesn't expire
        0, -- Free plan
        'usd'
    FROM workspaces w
    WHERE w.type = 'customer'
    AND NOT EXISTS (
        SELECT 1 FROM subscriptions s WHERE s.workspace_id = w.id
    )
    RETURNING id
)
INSERT INTO migration_log (phase, table_name, operation, records_affected, success)
SELECT 'PHASE_5', 'subscriptions', 'CREATE_FREE_PLANS', COUNT(*), TRUE
FROM subscription_creation;

-- ============================================================================
-- PHASE 6: DATA VALIDATION
-- ============================================================================

-- Validate migration results
DO $$
DECLARE
    validation_errors TEXT[] := ARRAY[]::TEXT[];
    error_count INTEGER := 0;
BEGIN
    -- Check all users have profiles
    SELECT COUNT(*) INTO error_count
    FROM backup_users bu
    WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = bu.id);
    
    IF error_count > 0 THEN
        validation_errors := array_append(validation_errors, 
            format('Missing user profiles: %s users', error_count));
    END IF;
    
    -- Check all users have workspace memberships
    SELECT COUNT(*) INTO error_count
    FROM backup_users bu
    WHERE bu.workspace_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM workspace_members wm 
        WHERE wm.user_id = bu.id AND wm.workspace_id = bu.workspace_id
    );
    
    IF error_count > 0 THEN
        validation_errors := array_append(validation_errors, 
            format('Missing workspace memberships: %s users', error_count));
    END IF;
    
    -- Check all workspaces have owners
    SELECT COUNT(*) INTO error_count
    FROM workspaces w
    WHERE w.type = 'customer' AND w.owner_id IS NULL;
    
    IF error_count > 0 THEN
        validation_errors := array_append(validation_errors, 
            format('Workspaces without owners: %s workspaces', error_count));
    END IF;
    
    -- Log validation results
    IF array_length(validation_errors, 1) > 0 THEN
        INSERT INTO migration_log (phase, table_name, operation, success, error_message)
        VALUES ('VALIDATION', 'ALL', 'VALIDATE_MIGRATION', FALSE, 
                array_to_string(validation_errors, '; '));
        
        RAISE EXCEPTION 'Migration validation failed: %', 
              array_to_string(validation_errors, '; ');
    ELSE
        INSERT INTO migration_log (phase, table_name, operation, success)
        VALUES ('VALIDATION', 'ALL', 'VALIDATE_MIGRATION', TRUE);
    END IF;
END $$;

-- ============================================================================
-- PHASE 7: CLEANUP OLD STRUCTURE (COMMENTED OUT FOR SAFETY)
-- ============================================================================

-- IMPORTANT: Only run this after thorough testing
-- DO NOT uncomment until you're 100% sure migration worked correctly

/*
-- Drop old foreign key constraints that reference old structure
-- ALTER TABLE assessments DROP CONSTRAINT IF EXISTS assessments_created_by_fkey;

-- Drop old tables (keep backups)
-- DROP TABLE IF EXISTS backup_users;
-- DROP TABLE IF EXISTS backup_workspaces;
-- DROP TABLE IF EXISTS backup_customers;

-- The original tables will be replaced by views or triggers if needed for compatibility
*/

-- Final migration summary
INSERT INTO migration_log (phase, table_name, operation, success)
VALUES ('COMPLETE', 'ALL', 'MIGRATION_FINISHED', TRUE);

-- Show migration summary
SELECT 
    phase,
    COUNT(*) as operations,
    SUM(records_affected) as total_records,
    BOOL_AND(success) as all_successful
FROM migration_log 
GROUP BY phase 
ORDER BY MIN(executed_at);

COMMIT;

-- ============================================================================
-- POST-MIGRATION VERIFICATION QUERIES
-- ============================================================================

-- Run these queries after migration to verify data integrity:

-- 1. Check user-workspace relationships
/*
SELECT 
    up.email,
    w.name as workspace_name,
    wm.role,
    wm.invitation_status
FROM user_profiles up
JOIN workspace_members wm ON up.id = wm.user_id
JOIN workspaces w ON wm.workspace_id = w.id
ORDER BY up.email, w.name;
*/

-- 2. Check workspace owners
/*
SELECT 
    w.name,
    w.slug,
    up.email as owner_email,
    w.subscription_tier
FROM workspaces w
LEFT JOIN user_profiles up ON w.owner_id = up.id
WHERE w.type = 'customer'
ORDER BY w.name;
*/

-- 3. Check assessments have proper workspace context
/*
SELECT 
    a.name as assessment_name,
    w.name as workspace_name,
    up.email as created_by_email
FROM assessments a
JOIN workspaces w ON a.workspace_id = w.id
JOIN user_profiles up ON a.created_by = up.id
ORDER BY w.name, a.created_at;
*/
