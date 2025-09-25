-- Monitoring table RLS migration
-- Adds workspace_id/user_id if missing, indexes, and RLS policies to allow
-- workspace members to read/insert/update, and owners/admins to delete.

-- 1) Columns (idempotent)
ALTER TABLE public.monitoring
  ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.monitoring
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL;

-- 2) Indexes (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'monitoring_workspace_id_idx' AND n.nspname = 'public') THEN
    CREATE INDEX monitoring_workspace_id_idx ON public.monitoring (workspace_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'monitoring_framework_id_idx' AND n.nspname = 'public') THEN
    CREATE INDEX monitoring_framework_id_idx ON public.monitoring (framework_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'monitoring_user_id_idx' AND n.nspname = 'public') THEN
    CREATE INDEX monitoring_user_id_idx ON public.monitoring (user_id);
  END IF;
END $$;

-- 3) Enable RLS (idempotent)
ALTER TABLE public.monitoring ENABLE ROW LEVEL SECURITY;

-- 4) Policies (recreate idempotently)
DO $$ BEGIN
  -- SELECT for active workspace members
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'monitoring' AND policyname = 'monitoring_select_members'
  ) THEN
    CREATE POLICY monitoring_select_members ON public.monitoring
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.workspace_members wm
          WHERE wm.workspace_id = monitoring.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.invitation_status = 'active'
        )
      );
  END IF;

  -- INSERT for active workspace members (must set workspace_id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'monitoring' AND policyname = 'monitoring_insert_members'
  ) THEN
    CREATE POLICY monitoring_insert_members ON public.monitoring
      FOR INSERT WITH CHECK (
        monitoring.workspace_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM public.workspace_members wm
          WHERE wm.workspace_id = monitoring.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.invitation_status = 'active'
        )
      );
  END IF;

  -- UPDATE for active workspace members
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'monitoring' AND policyname = 'monitoring_update_members'
  ) THEN
    CREATE POLICY monitoring_update_members ON public.monitoring
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.workspace_members wm
          WHERE wm.workspace_id = monitoring.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.invitation_status = 'active'
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.workspace_members wm
          WHERE wm.workspace_id = monitoring.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.invitation_status = 'active'
        )
      );
  END IF;

  -- DELETE for workspace owners/admins only
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'monitoring' AND policyname = 'monitoring_delete_admins'
  ) THEN
    CREATE POLICY monitoring_delete_admins ON public.monitoring
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.workspace_members wm
          WHERE wm.workspace_id = monitoring.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.invitation_status = 'active'
            AND wm.role IN ('owner','admin')
        )
      );
  END IF;
END $$;
