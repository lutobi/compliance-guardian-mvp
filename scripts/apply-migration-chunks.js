#!/usr/bin/env node

const dotenv = require('dotenv');
dotenv.config();
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  dotenv.config({ path: '.env.local' });
}
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const migrations = [
  // Create workspaces table
  `CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'customer' CHECK (type IN ('customer', 'system')),
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled')),
    owner_id UUID REFERENCES auth.users(id),
    industry TEXT,
    company_size TEXT,
    settings JSONB DEFAULT jsonb_build_object(
      'notifications_enabled', true,
      'auto_backup', true,
      'data_retention_days', 365
    ),
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT jsonb_build_object('max_assessments', 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,

  // Create workspace_members table
  `CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    permissions TEXT[] DEFAULT '{}',
    invitation_status TEXT NOT NULL DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'active', 'expired')),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    joined_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(workspace_id, user_id)
  );`,

  // Enable RLS
  `ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;`,

  // Create RLS policies
  `CREATE POLICY "Allow workspace access to members"
   ON public.workspaces
   FOR ALL
   TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM workspace_members wm 
       WHERE wm.workspace_id = id 
       AND wm.user_id = auth.uid()
       AND wm.invitation_status = 'active'
     )
   );`,

  `CREATE POLICY "Users can read own memberships"
   ON public.workspace_members
   FOR SELECT
   TO authenticated
   USING (user_id = auth.uid());`,

  `CREATE POLICY "Owners and admins can manage memberships"
   ON public.workspace_members
   FOR ALL
   TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM workspace_members wm
       WHERE wm.workspace_id = workspace_id
       AND wm.user_id = auth.uid()
       AND wm.role IN ('owner', 'admin')
       AND wm.invitation_status = 'active'
     )
   );`,

  // Create workspace management function
  `CREATE OR REPLACE FUNCTION create_workspace_with_owner(
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
        WHEN p_subscription_tier = 'free' THEN '{"basic_compliance", "basic_reporting"}'::jsonb
        WHEN p_subscription_tier = 'starter' THEN '{"basic_compliance", "basic_reporting", "advanced_reporting"}'::jsonb
        WHEN p_subscription_tier = 'pro' THEN '{"basic_compliance", "basic_reporting", "advanced_reporting", "api_access"}'::jsonb
        WHEN p_subscription_tier = 'enterprise' THEN '{"basic_compliance", "basic_reporting", "advanced_reporting", "api_access", "custom_frameworks"}'::jsonb
        ELSE '{"basic_compliance"}'::jsonb
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

    -- Update user's default workspace if they don't have one
    UPDATE user_profiles 
    SET default_workspace_id = v_workspace_id,
        updated_at = NOW()
    WHERE id = p_user_id 
      AND default_workspace_id IS NULL;

    RETURN v_workspace_id;
  END;
  $$;`
];

async function applyMigrations() {
  try {
    console.log('Creating Supabase client...');
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    for (let i = 0; i < migrations.length; i++) {
      const sql = migrations[i];
      console.log(`\nApplying migration chunk ${i + 1}/${migrations.length}...`);
      
      const { error } = await admin.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Failed to apply chunk ${i + 1}:`, error.message);
        continue;
      }
      
      console.log(`✅ Chunk ${i + 1} applied successfully`);
    }

    console.log('\n✅ All migrations completed');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

applyMigrations();
