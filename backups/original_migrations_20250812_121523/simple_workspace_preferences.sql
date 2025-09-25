-- Create workspace preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.workspace_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workspace_preferences_user_id_key UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.workspace_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.workspace_preferences;
CREATE POLICY "Users can view own preferences" ON public.workspace_preferences 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.workspace_preferences;
CREATE POLICY "Users can update own preferences" ON public.workspace_preferences 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.workspace_preferences;
CREATE POLICY "Users can insert own preferences" ON public.workspace_preferences 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
DROP TRIGGER IF EXISTS update_workspace_preferences_updated_at ON public.workspace_preferences;
CREATE TRIGGER update_workspace_preferences_updated_at
  BEFORE UPDATE ON public.workspace_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.workspace_preferences TO authenticated;
