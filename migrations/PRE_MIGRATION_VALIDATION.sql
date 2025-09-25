-- PRE-MIGRATION VALIDATION SCRIPT
-- Run this before executing the main migration to understand current state

-- ============================================================================
-- CURRENT SCHEMA ANALYSIS
-- ============================================================================

-- Check existing tables and their relationships
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check existing foreign key constraints
SELECT
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Check current data volumes
SELECT 
    'users' as table_name,
    COUNT(*) as record_count
FROM users
UNION ALL
SELECT 
    'workspaces' as table_name,
    COUNT(*) as record_count  
FROM workspaces
UNION ALL
SELECT 
    'assessments' as table_name,
    COUNT(*) as record_count
FROM assessments
UNION ALL
SELECT 
    'customers' as table_name,
    COUNT(*) as record_count
FROM customers;

-- Analyze current user-workspace relationships
SELECT 
    w.name as workspace_name,
    w.type as workspace_type,
    COUNT(u.id) as user_count
FROM workspaces w
LEFT JOIN users u ON w.id = u.workspace_id
GROUP BY w.id, w.name, w.type
ORDER BY user_count DESC;

-- Check for orphaned records
SELECT 
    'Users without workspaces' as issue,
    COUNT(*) as count
FROM users 
WHERE workspace_id IS NULL
UNION ALL
SELECT 
    'Assessments without users' as issue,
    COUNT(*) as count
FROM assessments a
LEFT JOIN users u ON a.created_by = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 
    'Customers without workspaces' as issue,
    COUNT(*) as count
FROM customers c
LEFT JOIN workspaces w ON c.workspace_id = w.id
WHERE w.id IS NULL;
