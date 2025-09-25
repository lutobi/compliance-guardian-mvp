-- Function to create a workspace and make the creator an owner
CREATE OR REPLACE FUNCTION create_workspace_with_owner(
  p_user_id UUID,
  p_workspace_name TEXT,
  p_workspace_slug TEXT,
  p_industry TEXT DEFAULT NULL,
  p_company_size TEXT DEFAULT NULL,
  p_subscription_tier TEXT DEFAULT 'free'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  -- Create the workspace
  INSERT INTO public.workspaces (
    name,
    slug,
    owner_id,
    industry,
    company_size,
    subscription_tier
  )
  VALUES (
    p_workspace_name,
    p_workspace_slug,
    p_user_id,
    p_industry,
    p_company_size,
    p_subscription_tier
  )
  RETURNING id INTO v_workspace_id;

  -- Add the creator as an owner
  INSERT INTO public.workspace_members (
    workspace_id,
    user_id,
    role,
    invitation_status,
    joined_at
  )
  VALUES (
    v_workspace_id,
    p_user_id,
    'owner',
    'active',
    NOW()
  );

  RETURN v_workspace_id;
END;
$$;
