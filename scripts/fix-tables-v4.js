#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple table creation SQL
const sql = `
-- Drop tables
DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;

-- Create workspaces table
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

-- Create workspace_members table
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
);`;

// Write to file
fs.writeFileSync(path.join(__dirname, 'tables-v4.sql'), sql);
console.log('Table SQL written to tables-v4.sql');
console.log('\nTo apply the tables:');
console.log('1. Go to https://supabase.com/dashboard/project/nrfpsbbkynykubcaarpg/sql/new');
console.log('2. Copy and paste the contents of scripts/tables-v4.sql');
console.log('3. Click "Run" to create the tables');

// Copy to clipboard
require('child_process').execSync(`cat "${path.join(__dirname, 'tables-v4.sql')}" | pbcopy`);
console.log('\nTable SQL has been copied to your clipboard');
