#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// SQL to verify everything
const sql = `
-- Get test user
SELECT id, email FROM auth.users WHERE email = 'test-user@example.com';

-- Check tables
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'workspaces' 
  AND column_name = 'slug'
) as has_workspaces_slug;

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'workspace_members' 
  AND column_name = 'role'
) as has_members_role;

-- Check function
SELECT pg_get_functiondef('public.create_workspace_with_owner(uuid,text,text,text,text,text)'::regprocedure);

-- Test function with actual user
DO $$
DECLARE
  v_user_id UUID;
  v_workspace_id UUID;
BEGIN
  -- Get test user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'test-user@example.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No test user found';
    RETURN;
  END IF;

  -- Test function
  SELECT create_workspace_with_owner(
    v_user_id,
    'Test Workspace',
    'test-workspace-' || floor(random() * 1000000)::text,
    'Technology',
    '1-10',
    'free'
  ) INTO v_workspace_id;

  RAISE NOTICE 'Created workspace %', v_workspace_id;
END $$;`;

// Write to file
fs.writeFileSync(path.join(__dirname, 'verify.sql'), sql);
console.log('SQL written to verify.sql');
console.log('\nTo verify:');
console.log('1. Go to https://supabase.com/dashboard/project/nrfpsbbkynykubcaarpg/sql/new');
console.log('2. Copy and paste the contents of scripts/verify.sql');
console.log('3. Click "Run" to verify everything');

// Copy to clipboard
require('child_process').execSync(`cat "${path.join(__dirname, 'verify.sql')}" | pbcopy`);
console.log('\nSQL has been copied to your clipboard');
