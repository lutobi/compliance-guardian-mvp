#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Extract just the function creation SQL
const sql = `
-- Create workspace management function
CREATE OR REPLACE FUNCTION create_workspace_with_owner(
  p_workspace_name TEXT,
  p_workspace_slug TEXT,
  p_user_id UUID,
  p_workspace_type TEXT DEFAULT 'team',
  p_subscription_tier TEXT DEFAULT 'free'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  -- Validate inputs
  IF p_workspace_name IS NULL OR trim(p_workspace_name) = '' THEN
    RAISE EXCEPTION 'Workspace name cannot be null or empty';
  END IF;

  IF p_workspace_slug IS NULL OR trim(p_workspace_slug) = '' THEN
    RAISE EXCEPTION 'Workspace slug cannot be null or empty';
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Owner ID cannot be null';
  END IF;

  -- Check if slug is already taken
  IF EXISTS (SELECT 1 FROM workspaces WHERE slug = p_workspace_slug) THEN
    RAISE EXCEPTION 'Workspace slug already exists';
  END IF;

  -- Create the workspace
  INSERT INTO workspaces (
    name,
    slug,
    type,
    subscription_tier,
    created_at,
    updated_at
  ) VALUES (
    p_workspace_name,
    p_workspace_slug,
    p_workspace_type,
    p_subscription_tier,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_workspace_id;

  -- Create workspace membership for the owner
  INSERT INTO workspace_members (
    workspace_id,
    user_id,
    role,
    created_at,
    updated_at
  ) VALUES (
    v_workspace_id,
    p_user_id,
    'owner',
    NOW(),
    NOW()
  );

  -- Update user's default workspace if they don't have one
  UPDATE user_profiles 
  SET default_workspace_id = v_workspace_id 
  WHERE user_id = p_user_id 
  AND default_workspace_id IS NULL;

  RETURN v_workspace_id;
END;
$$;`;

// Write to file
fs.writeFileSync(path.join(__dirname, 'function.sql'), sql);
console.log('Function SQL written to function.sql');
console.log('\nTo apply the function:');
console.log('1. Go to https://supabase.com/dashboard/project/nrfpsbbkynykubcaarpg/sql/new');
console.log('2. Copy and paste the contents of scripts/function.sql');
console.log('3. Click "Run" to create the function');

// Also copy to clipboard
require('child_process').execSync(`cat "${path.join(__dirname, 'function.sql')}" | pbcopy`);
console.log('\nFunction SQL has been copied to your clipboard');
