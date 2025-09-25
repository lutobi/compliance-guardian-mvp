-- Enable RLS on workspaces table
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create workspaces
CREATE POLICY "Allow authenticated users to create workspaces"
ON public.workspaces
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to read workspaces they are members of
CREATE POLICY "Allow users to read their workspaces"
ON public.workspaces
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = workspaces.id
    AND user_id = auth.uid()
    AND invitation_status = 'active'
  )
);

-- Allow workspace owners to update their workspaces
CREATE POLICY "Allow owners to update workspaces"
ON public.workspaces
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = workspaces.id
    AND user_id = auth.uid()
    AND role = 'owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = workspaces.id
    AND user_id = auth.uid()
    AND role = 'owner'
  )
);

-- Allow workspace owners to delete their workspaces
CREATE POLICY "Allow owners to delete workspaces"
ON public.workspaces
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = workspaces.id
    AND user_id = auth.uid()
    AND role = 'owner'
  )
);
