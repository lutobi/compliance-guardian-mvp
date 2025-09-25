-- Simplified Migration for Auth Fixes
-- ================================

-- 1. Create user_profiles table if missing
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  workspace_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS and add basic policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE POLICY "Users can manage their profile"
  ON public.user_profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Create workspaces table if missing
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create workspace_members table if missing
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  PRIMARY KEY (workspace_id, user_id)
);

-- 5. Enable RLS for workspaces and members
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- 6. Add basic workspace policies
CREATE POLICY "Users can view their workspaces"
  ON public.workspaces
  FOR SELECT
  USING (owner_id = auth.uid() OR 
         id IN (SELECT workspace_id FROM public.workspace_members 
                WHERE user_id = auth.uid()));

CREATE POLICY "Owners can manage workspaces"
  ON public.workspaces
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- 7. Add workspace member policies
CREATE POLICY "Users can view their memberships"
  ON public.workspace_members
  FOR SELECT
  USING (user_id = auth.uid());

-- 8. Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  wid UUID;
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Get user details
  SELECT email, raw_user_meta_data->>'name' 
  INTO user_email, user_name
  FROM auth.users WHERE id = NEW.id;
  
  -- Create workspace
  INSERT INTO public.workspaces (name, owner_id)
  VALUES (COALESCE(user_name, 'My Workspace'), NEW.id)
  RETURNING id INTO wid;
  
  -- Create profile
  INSERT INTO public.user_profiles (id, email, name, workspace_id)
  VALUES (NEW.id, user_email, user_name, wid);
  
  -- Add as workspace member
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (wid, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Set up trigger
DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error setting up trigger: %', SQLERRM;
END $$;

-- 10. Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
