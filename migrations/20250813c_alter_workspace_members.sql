-- Migration: Ensure workspace_members table has required columns for multi-tenant auth

-- 1. Create workspace_members table if it does not exist (idempotent)
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    invitation_status TEXT NOT NULL DEFAULT 'active' CHECK (invitation_status IN ('pending', 'active', 'suspended', 'declined')),
    invited_by UUID REFERENCES public.user_profiles(id),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ
);

-- 2. Add any missing columns (safe for existing installations)
ALTER TABLE public.workspace_members
    ADD COLUMN IF NOT EXISTS invitation_status TEXT NOT NULL DEFAULT 'active' CHECK (invitation_status IN ('pending', 'active', 'suspended', 'declined'));

ALTER TABLE public.workspace_members
    ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;

ALTER TABLE public.workspace_members
    ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.user_profiles(id);

ALTER TABLE public.workspace_members
    ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ;

ALTER TABLE public.workspace_members
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id);

-- 3. Create useful indexes
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_invitation_status ON public.workspace_members(invitation_status);

-- 4. Enable Row-Level Security and policies for active members
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Allow users to see their active workspace memberships
CREATE POLICY IF NOT EXISTS "Users can view their active memberships" ON public.workspace_members
    FOR SELECT USING (user_id = auth.uid() AND invitation_status = 'active');

-- Allow users to update last_accessed_at in their active memberships
CREATE POLICY IF NOT EXISTS "Users can update their last_accessed_at" ON public.workspace_members
    FOR UPDATE USING (user_id = auth.uid() AND invitation_status = 'active')
    WITH CHECK (user_id = auth.uid());
