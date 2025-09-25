
-- Drop existing function
DROP FUNCTION IF EXISTS public.create_workspace_with_owner(UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_workspace_with_owner(TEXT, TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_workspace_with_owner(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);

-- Create workspace management function
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
  -- Validate inputs
  IF p_workspace_name IS NULL OR trim(p_workspace_name) = '' THEN
    RAISE EXCEPTION 'Workspace name cannot be empty';
  END IF;
  
  IF p_workspace_slug IS NULL OR trim(p_workspace_slug) = '' THEN
    RAISE EXCEPTION 'Workspace slug cannot be empty';
  END IF;
  
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Owner ID cannot be null';
  END IF;

  -- Check if slug is already taken
  IF EXISTS (SELECT 1 FROM workspaces WHERE slug = p_workspace_slug) THEN
    RAISE EXCEPTION 'Workspace slug already exists: %', p_workspace_slug;
  END IF;

  -- Create the workspace
  INSERT INTO workspaces (
    name,
    slug,
    type,
    subscription_tier,
    subscription_status,
    owner_id,
    industry,
    company_size,
    settings,
    features,
    limits,
    created_at,
    updated_at
  ) VALUES (
    p_workspace_name,
    p_workspace_slug,
    'customer',
    p_subscription_tier,
    'active',
    p_user_id,
    p_industry,
    p_company_size,
    jsonb_build_object(
      'notifications_enabled', true,
      'auto_backup', true,
      'data_retention_days', 365
    ),
    CASE 
      WHEN p_subscription_tier = 'free' THEN '{"basic_compliance", "basic_reporting"}'::jsonb
      WHEN p_subscription_tier = 'starter' THEN '{"basic_compliance", "basic_reporting", "advanced_reporting"}'::jsonb
      WHEN p_subscription_tier = 'pro' THEN '{"basic_compliance", "basic_reporting", "advanced_reporting", "api_access"}'::jsonb
      WHEN p_subscription_tier = 'enterprise' THEN '{"basic_compliance", "basic_reporting", "advanced_reporting", "api_access", "custom_frameworks"}'::jsonb
      ELSE '{"basic_compliance"}'::jsonb
    END,
    jsonb_build_object(
      'max_assessments', CASE 
        WHEN p_subscription_tier = 'free' THEN 5
        WHEN p_subscription_tier = 'starter' THEN 25
        WHEN p_subscription_tier = 'pro' THEN 100
        WHEN p_subscription_tier = 'enterprise' THEN -1
        ELSE 5
      END
    ),
    NOW(),
    NOW()
  ) RETURNING id INTO v_workspace_id;

  -- Create workspace membership for the owner
  INSERT INTO workspace_members (
    workspace_id,
    user_id,
    role,
    invitation_status,
    invited_at,
    joined_at,
    created_at,
    updated_at
  ) VALUES (
    v_workspace_id,
    p_user_id,
    'owner',
    'active',
    NOW(),
    NOW(),
    NOW(),
    NOW()
  );

  -- Update user's default workspace if they don't have one
  UPDATE user_profiles 
  SET default_workspace_id = v_workspace_id,
      updated_at = NOW()
  WHERE id = p_user_id 
    AND default_workspace_id IS NULL;

  RETURN v_workspace_id;
END;
$$;