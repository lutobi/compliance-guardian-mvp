-- Create monitoring tables and related data structure
-- This migration handles the creation of monitoring, monitoring_controls, activities, risk_assessments, and verifications tables

-- Check if tables already exist
CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = table_name
  );
END;
$$ LANGUAGE plpgsql;

-- Create monitoring table if it doesn't exist
DO $$
BEGIN
  IF NOT check_table_exists('monitoring') THEN
    CREATE TABLE public.monitoring (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      framework_id UUID NOT NULL REFERENCES public.frameworks(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'active',
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Add RLS policy for monitoring
    ALTER TABLE public.monitoring ENABLE ROW LEVEL SECURITY;
    CREATE POLICY monitoring_workspace_policy ON public.monitoring
      USING (EXISTS (
        SELECT 1 FROM public.frameworks f
        JOIN public.workspaces w ON f.workspace_id = w.id
        JOIN public.team_members tm ON tm.workspace_id = w.id
        WHERE f.id = framework_id
        AND tm.user_id = auth.uid()
      ));

    -- Add update trigger for timestamp
    CREATE TRIGGER set_monitoring_timestamp
      BEFORE UPDATE ON public.monitoring
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();

    RAISE NOTICE 'Created monitoring table';
  ELSE
    RAISE NOTICE 'monitoring table already exists';
  END IF;
END
$$;

-- Create monitoring_controls table if it doesn't exist
DO $$
BEGIN
  IF NOT check_table_exists('monitoring_controls') THEN
    CREATE TABLE public.monitoring_controls (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      monitoring_id UUID NOT NULL REFERENCES public.monitoring(id) ON DELETE CASCADE,
      control_id UUID NOT NULL REFERENCES public.controls(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending',
      next_check TIMESTAMPTZ,
      last_check TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Add RLS policy for monitoring_controls
    ALTER TABLE public.monitoring_controls ENABLE ROW LEVEL SECURITY;
    CREATE POLICY monitoring_controls_workspace_policy ON public.monitoring_controls
      USING (EXISTS (
        SELECT 1 FROM public.monitoring m
        JOIN public.frameworks f ON m.framework_id = f.id
        JOIN public.workspaces w ON f.workspace_id = w.id
        JOIN public.team_members tm ON tm.workspace_id = w.id
        WHERE m.id = monitoring_id
        AND tm.user_id = auth.uid()
      ));

    -- Add update trigger for timestamp
    CREATE TRIGGER set_monitoring_controls_timestamp
      BEFORE UPDATE ON public.monitoring_controls
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();

    RAISE NOTICE 'Created monitoring_controls table';
  ELSE
    RAISE NOTICE 'monitoring_controls table already exists';
  END IF;
END
$$;

-- Create activities table if it doesn't exist
DO $$
BEGIN
  IF NOT check_table_exists('activities') THEN
    CREATE TABLE public.activities (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id UUID,
      details JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Add RLS policy for activities
    ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
    CREATE POLICY activities_workspace_policy ON public.activities
      USING (EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.workspace_id = workspace_id
        AND tm.user_id = auth.uid()
      ));

    RAISE NOTICE 'Created activities table';
  ELSE
    RAISE NOTICE 'activities table already exists';
  END IF;
END
$$;

-- Create risk_assessments table if it doesn't exist
DO $$
BEGIN
  IF NOT check_table_exists('risk_assessments') THEN
    CREATE TABLE public.risk_assessments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      description TEXT,
      mitigation TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Add RLS policy for risk_assessments
    ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
    CREATE POLICY risk_assessments_workspace_policy ON public.risk_assessments
      USING (EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.workspace_id = workspace_id
        AND tm.user_id = auth.uid()
      ));

    -- Add update trigger for timestamp
    CREATE TRIGGER set_risk_assessments_timestamp
      BEFORE UPDATE ON public.risk_assessments
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();

    -- Insert sample risk assessment data
    INSERT INTO public.risk_assessments (workspace_id, category, risk_level, description)
    SELECT 
      w.id, 
      category, 
      risk_level,
      'Sample risk assessment'
    FROM 
      public.workspaces w,
      (VALUES 
        ('Geographic', 'high'), 
        ('Geographic', 'medium'), 
        ('Supply Chain', 'low'),
        ('Supply Chain', 'medium'),
        ('Product', 'high'),
        ('Supplier', 'medium')
      ) AS risks(category, risk_level);

    RAISE NOTICE 'Created risk_assessments table';
  ELSE
    RAISE NOTICE 'risk_assessments table already exists';
  END IF;
END
$$;

-- Create verifications table if it doesn't exist
DO $$
BEGIN
  IF NOT check_table_exists('verifications') THEN
    CREATE TABLE public.verifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
      total_checks INTEGER DEFAULT 0,
      passed_checks INTEGER DEFAULT 0,
      pending_checks INTEGER DEFAULT 0,
      failed_checks INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Add RLS policy for verifications
    ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
    CREATE POLICY verifications_workspace_policy ON public.verifications
      USING (EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.workspace_id = workspace_id
        AND tm.user_id = auth.uid()
      ));

    -- Add update trigger for timestamp
    CREATE TRIGGER set_verifications_timestamp
      BEFORE UPDATE ON public.verifications
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();

    -- Insert sample verification data
    INSERT INTO public.verifications (workspace_id, total_checks, passed_checks, pending_checks, failed_checks)
    SELECT 
      w.id, 
      100, 
      60, 
      30, 
      10
    FROM 
      public.workspaces w;

    RAISE NOTICE 'Created verifications table';
  ELSE
    RAISE NOTICE 'verifications table already exists';
  END IF;
END
$$;
