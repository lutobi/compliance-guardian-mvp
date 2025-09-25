-- Fix RLS policies for user_profiles table
-- This ensures users can create, read, and update their own profiles

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can read their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow system to create profiles during signup
CREATE POLICY "System can create user profiles"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);

-- Also fix workspace_members policies
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.workspace_members TO authenticated;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can insert their own workspace memberships" ON public.workspace_members;

-- Recreate policies
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

CREATE POLICY "System can create workspace memberships"
  ON public.workspace_members
  FOR INSERT
  WITH CHECK (true);