-- Migration: Create workspace_preferences table with multi-tenant security
--
-- Purpose: Store user preferences that are workspace-specific with proper RLS policies
-- Ensures secure multi-tenant data isolation with workspace-level access control
-- Supports user and workspace admin operations with proper permission checks

-- Check if the table already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'workspace_preferences' AND schemaname = 'public') THEN
        -- Create the workspace_preferences table
        CREATE TABLE IF NOT EXISTS public.workspace_preferences (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            workspace_id UUID NOT NULL,
            theme TEXT DEFAULT 'light',
            notification_preferences JSONB DEFAULT '{"email": true, "inapp": true}'::jsonb,
            display_preferences JSONB DEFAULT '{"compactView": false, "showHelpTips": true}'::jsonb,
            dashboard_layout JSONB DEFAULT '{"widgets": ["summary", "recent", "tasks"]}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            -- Composite unique constraint - one set of preferences per user per workspace
            CONSTRAINT workspace_preferences_user_workspace_key UNIQUE (user_id, workspace_id)
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

        -- Add comprehensive multi-tenant RLS policies
        ALTER TABLE public.workspace_preferences ENABLE ROW LEVEL SECURITY;
        
        -- Base RLS function for workspace membership check
        CREATE OR REPLACE FUNCTION check_workspace_member(workspace_id_param UUID, required_role TEXT DEFAULT NULL)
        RETURNS BOOLEAN AS $$
        DECLARE
            is_member BOOLEAN;
            user_role TEXT;
        BEGIN
            -- Check if current user is a member of the specified workspace
            SELECT EXISTS (
                SELECT 1 
                FROM public.workspace_members wm 
                WHERE wm.workspace_id = workspace_id_param 
                AND wm.user_id = auth.uid()
            ) INTO is_member;
            
            -- If no specific role required, just return membership status
            IF required_role IS NULL THEN
                RETURN is_member;
            END IF;
            
            -- Check if the user has the required role
            SELECT wm.role INTO user_role
            FROM public.workspace_members wm 
            WHERE wm.workspace_id = workspace_id_param 
            AND wm.user_id = auth.uid();
            
            -- Return true if user has the required role
            RETURN is_member AND user_role = required_role;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        -- User policies
        CREATE POLICY "Users can view their own workspace preferences"
            ON public.workspace_preferences
            FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can update their own workspace preferences"
            ON public.workspace_preferences
            FOR UPDATE
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own workspace preferences"
            ON public.workspace_preferences
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own workspace preferences"
            ON public.workspace_preferences
            FOR DELETE
            USING (auth.uid() = user_id);
            
        -- Workspace admin policies
        CREATE POLICY "Workspace admins can view all preferences in their workspace"
            ON public.workspace_preferences
            FOR SELECT
            USING (
                check_workspace_member(workspace_id, 'admin') OR 
                check_workspace_member(workspace_id, 'owner')
            );
            
        CREATE POLICY "Workspace admins can update preferences in their workspace"
            ON public.workspace_preferences
            FOR UPDATE
            USING (
                check_workspace_member(workspace_id, 'admin') OR 
                check_workspace_member(workspace_id, 'owner')
            );
            
        CREATE POLICY "Workspace admins can insert preferences for their workspace"
            ON public.workspace_preferences
            FOR INSERT
            WITH CHECK (
                check_workspace_member(workspace_id, 'admin') OR 
                check_workspace_member(workspace_id, 'owner')
            );

        RAISE NOTICE 'Created workspace_preferences table with RLS policies';
    ELSE
        RAISE NOTICE 'workspace_preferences table already exists';
    END IF;
END
$$;
  