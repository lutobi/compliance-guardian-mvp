-- Create the function to create frameworks table if it doesn't exist
CREATE OR REPLACE FUNCTION create_frameworks_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.frameworks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR NOT NULL,
    version VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Add RLS policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'frameworks'
  ) THEN
    ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated users to read frameworks"
      ON public.frameworks
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the function to create controls table if it doesn't exist
CREATE OR REPLACE FUNCTION create_controls_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.controls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    framework_id UUID REFERENCES public.frameworks(id) ON DELETE CASCADE,
    control_id VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(framework_id, control_id)
  );

  -- Add RLS policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'controls'
  ) THEN
    ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated users to read controls"
      ON public.controls
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the function to create subcontrols table if it doesn't exist
CREATE OR REPLACE FUNCTION create_subcontrols_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.subcontrols (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    control_id UUID REFERENCES public.controls(id) ON DELETE CASCADE,
    subcontrol_id VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    guidance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(control_id, subcontrol_id)
  );

  -- Add RLS policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subcontrols'
  ) THEN
    ALTER TABLE public.subcontrols ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated users to read subcontrols"
      ON public.subcontrols
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END;
$$ LANGUAGE plpgsql;
