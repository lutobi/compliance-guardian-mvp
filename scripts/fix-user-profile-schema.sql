-- Fix user_profiles table schema conflicts
-- This ensures the table has the correct columns expected by the application

-- Add default_workspace_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'user_profiles' 
                AND column_name = 'default_workspace_id') THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN default_workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Ensure RLS policies exist for user_profiles
CREATE POLICY IF NOT EXISTS "Users can read their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can create their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
