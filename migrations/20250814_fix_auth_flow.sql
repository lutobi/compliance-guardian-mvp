-- Migration: Fix Authentication and User Profile Initialization
-- ===========================================================
-- This migration ensures proper RLS policies and provides a secure function
-- for initializing user profiles and workspaces.

-- 1. Ensure the auth.uid() function is available
create or replace function auth.uid()
returns uuid
language sql stable
as $$
  select 
    nullif(
      coalesce(
        current_setting('request.jwt.claim.sub', true),
        (current_setting('request.jwt.claims', true)::jsonb->>'sub')
      ),
      ''
    )::uuid
$$;

-- 2. Fix user_profiles table if needed
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'user_profiles' 
                AND column_name = 'workspace_id') THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;
  END IF;
  
  -- Add other missing columns as needed
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'user_profiles' 
                AND column_name = 'user_type') THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN user_type TEXT DEFAULT 'customer';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'user_profiles' 
                AND column_name = 'role_name') THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN role_name TEXT DEFAULT 'member';
  END IF;
END $$;

-- 3. Create or replace the secure function for user profile and workspace initialization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id UUID;
  new_workspace_slug TEXT;
  user_email TEXT;
  user_name TEXT;
  user_avatar_url TEXT;
BEGIN
  -- Get user details from auth.users
  SELECT email, raw_user_meta_data->>'name', raw_user_meta_data->>'avatar_url'
  INTO user_email, user_name, user_avatar_url
  FROM auth.users
  WHERE id = NEW.id
  LIMIT 1;
  
  -- Create a new workspace for the user
  new_workspace_slug := regexp_replace(
    lower(regexp_replace(user_email, '@[^@]+$', '')), 
    '[^a-z0-9]+', '-', 'g'
  ) || '-' || substr(md5(random()::text), 1, 8);
  
  -- Insert the new workspace
  INSERT INTO public.workspaces (
    slug, 
    name, 
    type, 
    settings, 
    created_at, 
    updated_at
  ) VALUES (
    new_workspace_slug,
    split_part(user_email, '@', 1) || '''s Workspace',
    'customer',
    '{}'::jsonb,
    NOW(),
    NOW()
  )
  RETURNING id INTO new_workspace_id;
  
  -- Create the user profile
  INSERT INTO public.user_profiles (
    id,
    email,
    name,
    avatar_url,
    user_type,
    workspace_id,
    role_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    user_email,
    COALESCE(user_name, split_part(user_email, '@', 1)),
    user_avatar_url,
    'customer',
    new_workspace_id,
    'owner',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, user_profiles.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
    updated_at = NOW()
  RETURNING id INTO NEW.id;
  
  -- Add user as workspace owner
  INSERT INTO public.workspace_members (
    workspace_id,
    user_id,
    role,
    invitation_status,
    invited_at,
    joined_at
  ) VALUES (
    new_workspace_id,
    NEW.id,
    'owner',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (workspace_id, user_id) DO UPDATE
  SET 
    role = 'owner',
    invitation_status = 'active',
    joined_at = COALESCE(workspace_members.joined_at, NOW()),
    last_accessed_at = NOW();
  
  -- Update the workspace with the owner ID
  UPDATE public.workspaces
  SET owner_id = NEW.id
  WHERE id = new_workspace_id;
  
  RETURN NEW;
END;
$$;

-- 4. Create the trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Ensure RLS is enabled on all relevant tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- 6. Create or replace RLS policies for workspaces
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;
CREATE POLICY "Users can view workspaces they are members of"
  ON public.workspaces
  FOR SELECT
  USING (
    id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid() 
      AND invitation_status = 'active'
    )
  );

-- 7. Create or replace RLS policies for workspace members
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON public.workspace_members;
CREATE POLICY "Users can view members of their workspaces"
  ON public.workspace_members
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid() 
      AND invitation_status = 'active'
    )
  );

-- 8. Create a policy to allow users to insert into workspace_members as part of the signup flow
DROP POLICY IF EXISTS "Users can insert their own workspace memberships" ON public.workspace_members;
CREATE POLICY "Users can insert their own workspace memberships"
  ON public.workspace_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 9. Create a policy to allow users to update their own workspace memberships
DROP POLICY IF EXISTS "Users can update their own workspace memberships" ON public.workspace_members;
CREATE POLICY "Users can update their own workspace memberships"
  ON public.workspace_members
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 10. Create a policy to allow workspace owners to manage members
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;
CREATE POLICY "Workspace owners can manage members"
  ON public.workspace_members
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
      AND invitation_status = 'active'
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
      AND invitation_status = 'active'
    )
  );

-- 11. Grant necessary permissions
GRANT ALL ON public.workspaces TO authenticated, service_role;
GRANT ALL ON public.workspace_members TO authenticated, service_role;
GRANT ALL ON public.user_profiles TO authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- 12. Create a function to get the current user's workspace ID
CREATE OR REPLACE FUNCTION public.get_user_workspace_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  user_workspace_id UUID;
BEGIN
  SELECT workspace_id INTO user_workspace_id
  FROM public.user_profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN user_workspace_id;
END;
$$;

-- 13. Create a function to get the current user's role in a workspace
CREATE OR REPLACE FUNCTION public.get_user_role(p_workspace_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.workspace_members
  WHERE user_id = auth.uid()
  AND workspace_id = p_workspace_id
  AND invitation_status = 'active'
  LIMIT 1;
  
  RETURN user_role;
END;
$$;
