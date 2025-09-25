-- Creates a function to check if a table exists in the database
-- Usage: SELECT * FROM check_table_exists('table_name');

CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean AS $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION check_table_exists TO service_role;
GRANT EXECUTE ON FUNCTION check_table_exists TO authenticated;

-- Create the settings table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.settings (
  workspace_id TEXT PRIMARY KEY,
  workspace_name TEXT NOT NULL DEFAULT 'Default Workspace',
  default_compliance_framework TEXT DEFAULT 'EUDR',
  locale TEXT DEFAULT 'en-US',
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'yyyy-MM-dd',
  time_format TEXT DEFAULT '24h',
  notifications_enabled BOOLEAN DEFAULT true,
  compliance_frequency TEXT CHECK (compliance_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
  notification_threshold INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on settings table if not already enabled
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'settings' 
    AND policyname = 'Authenticated users can view settings'
  ) THEN
    CREATE POLICY "Authenticated users can view settings" ON settings
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'settings' 
    AND policyname = 'Admins can update settings'
  ) THEN
    CREATE POLICY "Admins can update settings" ON settings
      FOR UPDATE
      USING (EXISTS (
          SELECT 1 FROM users 
          WHERE users.id = auth.uid() 
          AND (users.role = 'admin' OR users.role = 'owner')
      ));
  END IF;
END $$;

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates if it doesn't exist
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create the team_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid primary key default uuid_generate_v4(),
  workspace_id text references public.settings(workspace_id) ON DELETE CASCADE,
  email text not null,
  role text not null check (role in ('owner','admin','editor','viewer')),
  status text not null default 'pending' check (status in ('pending','active')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz
);

-- Enable RLS on team_members table
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for team_members if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'team_members' 
    AND policyname = 'Team members can view team'
  ) THEN
    CREATE POLICY "Team members can view team" ON team_members
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;
