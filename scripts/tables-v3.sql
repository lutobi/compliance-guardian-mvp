
-- Drop tables with CASCADE to handle dependencies
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP TABLE IF EXISTS public.workspace_members CASCADE;

-- Recreate workspaces table with complete schema
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

-- Recreate workspace_members table with complete schema
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

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow workspace access to members" ON public.workspaces;
DROP POLICY IF EXISTS "Users can read own memberships" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and admins can manage memberships" ON public.workspace_members;

-- Create RLS policies
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

-- Recreate dependent policies
CREATE POLICY "Workspace admins can view invitation audit logs"
ON invitation_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = invitation_events.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
    AND wm.invitation_status = 'active'
  )
);

CREATE POLICY "Workspace members can view onboarding steps"
ON onboarding_steps
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = onboarding_steps.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.invitation_status = 'active'
  )
);

CREATE POLICY "Workspace admins can update onboarding steps"
ON onboarding_steps
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = onboarding_steps.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
    AND wm.invitation_status = 'active'
  )
);