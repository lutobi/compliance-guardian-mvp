
-- Check if tables exist
DO $$
DECLARE
  v_workspace_exists boolean;
  v_members_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'workspaces'
  ) INTO v_workspace_exists;

  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'workspace_members'
  ) INTO v_members_exists;

  -- Create or update workspaces table
  IF NOT v_workspace_exists THEN
    CREATE TABLE public.workspaces (
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
    );
  ELSE
    -- Add missing columns if table exists
    BEGIN
      ALTER TABLE public.workspaces 
        ADD COLUMN IF NOT EXISTS slug TEXT,
        ADD COLUMN IF NOT EXISTS name TEXT,
        ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'customer',
        ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
        ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id),
        ADD COLUMN IF NOT EXISTS industry TEXT,
        ADD COLUMN IF NOT EXISTS company_size TEXT,
        ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT jsonb_build_object(
          'notifications_enabled', true,
          'auto_backup', true,
          'data_retention_days', 365
        ),
        ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS limits JSONB DEFAULT jsonb_build_object('max_assessments', 5),
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

      -- Set NOT NULL constraints
      ALTER TABLE public.workspaces 
        ALTER COLUMN slug SET NOT NULL,
        ALTER COLUMN name SET NOT NULL,
        ALTER COLUMN type SET NOT NULL,
        ALTER COLUMN subscription_tier SET NOT NULL,
        ALTER COLUMN subscription_status SET NOT NULL,
        ALTER COLUMN created_at SET NOT NULL,
        ALTER COLUMN updated_at SET NOT NULL;

      -- Add constraints
      ALTER TABLE public.workspaces 
        ADD CONSTRAINT IF NOT EXISTS workspaces_slug_key UNIQUE (slug),
        ADD CONSTRAINT IF NOT EXISTS workspaces_type_check 
          CHECK (type IN ('customer', 'system')),
        ADD CONSTRAINT IF NOT EXISTS workspaces_subscription_tier_check 
          CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
        ADD CONSTRAINT IF NOT EXISTS workspaces_subscription_status_check 
          CHECK (subscription_status IN ('active', 'past_due', 'canceled'));
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error adding columns to workspaces: %', SQLERRM;
    END;
  END IF;

  -- Create or update workspace_members table
  IF NOT v_members_exists THEN
    CREATE TABLE public.workspace_members (
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
    );
  ELSE
    -- Add missing columns if table exists
    BEGIN
      ALTER TABLE public.workspace_members 
        ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member',
        ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ DEFAULT now(),
        ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

      -- Set NOT NULL constraints
      ALTER TABLE public.workspace_members 
        ALTER COLUMN workspace_id SET NOT NULL,
        ALTER COLUMN user_id SET NOT NULL,
        ALTER COLUMN role SET NOT NULL,
        ALTER COLUMN invitation_status SET NOT NULL,
        ALTER COLUMN invited_at SET NOT NULL,
        ALTER COLUMN created_at SET NOT NULL,
        ALTER COLUMN updated_at SET NOT NULL;

      -- Add constraints
      ALTER TABLE public.workspace_members 
        ADD CONSTRAINT IF NOT EXISTS workspace_members_role_check 
          CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
        ADD CONSTRAINT IF NOT EXISTS workspace_members_invitation_status_check 
          CHECK (invitation_status IN ('pending', 'active', 'expired')),
        ADD CONSTRAINT IF NOT EXISTS workspace_members_workspace_user_key 
          UNIQUE (workspace_id, user_id);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error adding columns to workspace_members: %', SQLERRM;
    END;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Allow workspace access to members" ON public.workspaces;
DROP POLICY IF EXISTS "Users can read own memberships" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and admins can manage memberships" ON public.workspace_members;

CREATE POLICY "Allow workspace access to members"
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
    AND wm.invitation_status = 'active'
  )
);

-- Drop and recreate function
DROP FUNCTION IF EXISTS public.create_workspace_with_owner(UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_workspace_with_owner(TEXT, TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_workspace_with_owner(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);

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
$$;