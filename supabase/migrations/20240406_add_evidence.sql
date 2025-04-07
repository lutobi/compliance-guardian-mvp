-- Create the function to create evidence table if it doesn't exist
CREATE OR REPLACE FUNCTION create_evidence_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subcontrol_id UUID REFERENCES public.subcontrols(id) ON DELETE CASCADE,
    framework_id UUID REFERENCES public.frameworks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    files JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Add RLS policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'evidence'
  ) THEN
    ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
    
    -- Allow users to read their own evidence
    CREATE POLICY "Users can read own evidence"
      ON public.evidence
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());

    -- Allow users to insert their own evidence
    CREATE POLICY "Users can insert own evidence"
      ON public.evidence
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());

    -- Allow users to update their own evidence
    CREATE POLICY "Users can update own evidence"
      ON public.evidence
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());

    -- Allow users to delete their own evidence
    CREATE POLICY "Users can delete own evidence"
      ON public.evidence
      FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  -- Create updated_at trigger if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_timestamp'
  ) THEN
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER set_updated_at_timestamp
      BEFORE UPDATE ON public.evidence
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_evidence_if_not_exists();
