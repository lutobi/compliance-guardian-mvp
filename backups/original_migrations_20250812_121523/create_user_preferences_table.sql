-- Create workspace_preferences table for storing user preferred workspace settings
-- This table helps with assessment visibility and ownership across workspaces

-- Check if the table already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'workspace_preferences' AND schemaname = 'public') THEN
        -- Create the workspace_preferences table
        CREATE TABLE IF NOT EXISTS public.workspace_preferences (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            workspace_id UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT workspace_preferences_user_id_key UNIQUE (user_id)
        );

        -- Add foreign key constraints if possible (comment out if they cause issues)
        ALTER TABLE public.workspace_preferences
            ADD CONSTRAINT workspace_preferences_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

        ALTER TABLE public.workspace_preferences
            ADD CONSTRAINT workspace_preferences_workspace_id_fkey
            FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;

        -- Create index for faster lookups
        CREATE INDEX IF NOT EXISTS workspace_preferences_user_id_idx ON public.workspace_preferences(user_id);
        CREATE INDEX IF NOT EXISTS workspace_preferences_workspace_id_idx ON public.workspace_preferences(workspace_id);

        -- Create a function to update the updated_at timestamp
        CREATE OR REPLACE FUNCTION update_workspace_preferences_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create a trigger to update the updated_at timestamp
        CREATE TRIGGER workspace_preferences_updated_at
        BEFORE UPDATE ON public.workspace_preferences
        FOR EACH ROW
        EXECUTE FUNCTION update_workspace_preferences_updated_at();

        -- Add RLS policies if needed
        ALTER TABLE public.workspace_preferences ENABLE ROW LEVEL SECURITY;

        -- Allow users to see their own workspace preferences
        CREATE POLICY "Users can view their own workspace preferences"
            ON public.workspace_preferences
            FOR SELECT
            USING (auth.uid() = user_id);

        -- Allow users to update their own workspace preferences
        CREATE POLICY "Users can update their own workspace preferences"
            ON public.workspace_preferences
            FOR UPDATE
            USING (auth.uid() = user_id);

        -- Allow users to insert their own workspace preferences
        CREATE POLICY "Users can insert their own workspace preferences"
            ON public.workspace_preferences
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        -- Allow users to delete their own workspace preferences
        CREATE POLICY "Users can delete their own workspace preferences"
            ON public.workspace_preferences
            FOR DELETE
            USING (auth.uid() = user_id);

        RAISE NOTICE 'Created workspace_preferences table with RLS policies';
    ELSE
        RAISE NOTICE 'workspace_preferences table already exists';
    END IF;
END
$$;
  