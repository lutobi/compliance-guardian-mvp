
-- Drop everything and start fresh
DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP FUNCTION IF EXISTS public.create_workspace_with_owner CASCADE;

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
AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  -- Create workspace
  INSERT INTO workspaces (
    name,
    slug,
    owner_id,
    industry,
    company_size,
    subscription_tier
  ) VALUES (
    p_workspace_name,
    p_workspace_slug,
    p_user_id,
    p_industry,
    p_company_size,
    p_subscription_tier
  ) RETURNING id INTO v_workspace_id;

  -- Create owner membership
  INSERT INTO workspace_members (
    workspace_id,
    user_id,
    role,
    invitation_status,
    joined_at
  ) VALUES (
    v_workspace_id,
    p_user_id,
    'owner',
    'active',
    now()
  );

  RETURN v_workspace_id;
END;
$$;