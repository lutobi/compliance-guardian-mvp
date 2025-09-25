#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Complete SQL to fix everything
const sql = `
-- Drop everything first
DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP FUNCTION IF EXISTS public.create_workspace_with_owner CASCADE;

-- Create tables
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'customer',
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  subscription_status TEXT NOT NULL DEFAULT 'active',
  owner_id UUID REFERENCES auth.users(id),
  industry TEXT,
  company_size TEXT,
  settings JSONB DEFAULT '{}',
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  permissions TEXT[] DEFAULT '{}',
  invitation_status TEXT NOT NULL DEFAULT 'pending',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow workspace access to members"
ON public.workspaces
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm 
    WHERE wm.workspace_id = id 
    AND wm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read own memberships"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Owners and admins can manage memberships"
ON public.workspace_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
);

-- Create function
CREATE OR REPLACE FUNCTION create_workspace_with_owner(
  p_user_id UUID,
  p_workspace_name TEXT,
  p_workspace_slug TEXT,
  p_industry TEXT DEFAULT NULL,
  p_company_size TEXT DEFAULT NULL,
  p_subscription_tier TEXT DEFAULT 'free'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  -- Validate inputs
  IF p_workspace_name IS NULL OR trim(p_workspace_name) = '' THEN
    RAISE EXCEPTION 'Workspace name cannot be empty';
  END IF;
  
  IF p_workspace_slug IS NULL OR trim(p_workspace_slug) = '' THEN
    RAISE EXCEPTION 'Workspace slug cannot be empty';
  END IF;
  
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Owner ID cannot be null';
  END IF;

  -- Check if slug is already taken
  IF EXISTS (SELECT 1 FROM workspaces WHERE slug = p_workspace_slug) THEN
    RAISE EXCEPTION 'Workspace slug already exists: %', p_workspace_slug;
  END IF;

  -- Create the workspace
  INSERT INTO workspaces (
    name,
    slug,
    type,
    subscription_tier,
    subscription_status,
    owner_id,
    industry,
    company_size,
    settings,
    features,
    limits,
    created_at,
    updated_at
  ) VALUES (
    p_workspace_name,
    p_workspace_slug,
    'customer',
    p_subscription_tier,
    'active',
    p_user_id,
    p_industry,
    p_company_size,
    jsonb_build_object(
      'notifications_enabled', true,
      'auto_backup', true,
      'data_retention_days', 365
    ),
    CASE 
      WHEN p_subscription_tier = 'free' THEN '["basic_compliance", "basic_reporting"]'::jsonb
      WHEN p_subscription_tier = 'starter' THEN '["basic_compliance", "basic_reporting", "advanced_reporting"]'::jsonb
      WHEN p_subscription_tier = 'pro' THEN '["basic_compliance", "basic_reporting", "advanced_reporting", "api_access"]'::jsonb
      WHEN p_subscription_tier = 'enterprise' THEN '["basic_compliance", "basic_reporting", "advanced_reporting", "api_access", "custom_frameworks"]'::jsonb
      ELSE '["basic_compliance"]'::jsonb
    END,
    jsonb_build_object(
      'max_assessments', CASE 
        WHEN p_subscription_tier = 'free' THEN 5
        WHEN p_subscription_tier = 'starter' THEN 25
        WHEN p_subscription_tier = 'pro' THEN 100
        WHEN p_subscription_tier = 'enterprise' THEN -1
        ELSE 5
      END
    ),
    NOW(),
    NOW()
  ) RETURNING id INTO v_workspace_id;

  -- Create workspace membership for the owner
  INSERT INTO workspace_members (
    workspace_id,
    user_id,
    role,
    invitation_status,
    invited_at,
    joined_at,
    created_at,
    updated_at
  ) VALUES (
    v_workspace_id,
    p_user_id,
    'owner',
    'active',
    NOW(),
    NOW(),
    NOW(),
    NOW()
  );

  RETURN v_workspace_id;
END;
$$;`;

// Write to file
fs.writeFileSync(path.join(__dirname, 'final-fix.sql'), sql);
console.log('SQL written to final-fix.sql');
console.log('\nTo apply the fix:');
console.log('1. Go to https://supabase.com/dashboard/project/nrfpsbbkynykubcaarpg/sql/new');
console.log('2. Copy and paste the contents of scripts/final-fix.sql');
console.log('3. Click "Run" to apply all changes');

// Copy to clipboard
require('child_process').execSync(`cat "${path.join(__dirname, 'final-fix.sql')}" | pbcopy`);
console.log('\nSQL has been copied to your clipboard');
