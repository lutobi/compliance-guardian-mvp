-- Migration: Workspace Transaction Functions
-- Purpose: Create database functions for handling workspace operations in transactions

BEGIN;

-- Function to create a workspace with all related records in a transaction
CREATE OR REPLACE FUNCTION create_workspace(
  workspace_name TEXT,
  workspace_description TEXT,
  user_id UUID,
  workspace_industry TEXT DEFAULT NULL,
  workspace_company_size TEXT DEFAULT NULL,
  workspace_settings JSONB DEFAULT '{}'::jsonb
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_workspace_id UUID;
  new_workspace_slug TEXT;
  subscription_tier_id UUID;
BEGIN
  -- Generate a unique slug
  new_workspace_slug := slugify(workspace_name);
  
  -- Check if slug exists and append random characters if needed
  WHILE EXISTS (SELECT 1 FROM public.workspaces WHERE slug = new_workspace_slug) LOOP
    new_workspace_slug := new_workspace_slug || '-' || substring(md5(random()::text) from 1 for 5);
  END LOOP;
  
  -- Insert new workspace
  INSERT INTO public.workspaces (
    name, 
    slug, 
    description, 
    created_by, 
    industry, 
    company_size, 
    settings
  )
  VALUES (
    workspace_name,
    new_workspace_slug,
    workspace_description,
    user_id,
    workspace_industry,
    workspace_company_size,
    workspace_settings
  )
  RETURNING id INTO new_workspace_id;
  
  -- Add the creator as the owner
  INSERT INTO public.workspace_members (
    workspace_id,
    user_id,
    role
  )
  VALUES (
    new_workspace_id,
    user_id,
    'owner'
  );
  
  -- Get the free tier ID (or default if not found)
  SELECT id INTO subscription_tier_id
  FROM public.subscription_tiers
  WHERE code = 'free'
  LIMIT 1;
  
  -- Create free tier subscription
  INSERT INTO public.workspace_subscriptions (
    workspace_id,
    tier_id,
    status,
    trial_end
  )
  VALUES (
    new_workspace_id,
    subscription_tier_id,
    'active',
    NOW() + INTERVAL '14 days'
  );
  
  -- Insert default onboarding steps
  INSERT INTO public.onboarding_steps (
    workspace_id,
    step_name,
    completed
  )
  VALUES
    (new_workspace_id, 'setup_profile', false),
    (new_workspace_id, 'invite_team', false),
    (new_workspace_id, 'select_compliance_frameworks', false),
    (new_workspace_id, 'create_assessment', false);
  
  -- Log the workspace creation event
  INSERT INTO public.workspace_events (
    workspace_id,
    event_type,
    actor_id,
    metadata
  )
  VALUES (
    new_workspace_id,
    'workspace_created',
    user_id,
    jsonb_build_object(
      'workspace_name', workspace_name,
      'industry', workspace_industry,
      'company_size', workspace_company_size
    )
  );
  
  -- Return the new workspace data
  RETURN jsonb_build_object(
    'id', new_workspace_id,
    'name', workspace_name,
    'slug', new_workspace_slug,
    'description', workspace_description
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Create or replace slugify function
CREATE OR REPLACE FUNCTION slugify(value TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result TEXT;
BEGIN
  -- Convert to lowercase
  result := LOWER(value);
  
  -- Replace spaces with hyphens
  result := REPLACE(result, ' ', '-');
  
  -- Remove special characters
  result := REGEXP_REPLACE(result, '[^a-z0-9\-]', '', 'g');
  
  -- Replace multiple hyphens with a single one
  result := REGEXP_REPLACE(result, '\-+', '-', 'g');
  
  -- Remove leading and trailing hyphens
  result := TRIM(BOTH '-' FROM result);
  
  RETURN result;
END;
$$;

-- Function to check if a user can create more workspaces
CREATE OR REPLACE FUNCTION can_user_create_workspace(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
  max_limit INTEGER;
BEGIN
  -- Get current count and limit
  SELECT 
    COALESCE(ul.current_workspace_count, 0),
    COALESCE(ul.max_workspaces, 1)
  INTO
    current_count,
    max_limit
  FROM
    public.user_limits ul
  WHERE
    ul.user_id = user_id_param;
    
  -- If no record exists, assume default limit
  IF current_count IS NULL THEN
    current_count := 0;
    max_limit := 1;
  END IF;
  
  RETURN current_count < max_limit;
END;
$$;

COMMIT;
