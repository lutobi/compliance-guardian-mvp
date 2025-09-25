-- ============================================================================
-- WORKSPACE MANAGEMENT DATABASE FUNCTIONS
-- ============================================================================
-- This script creates essential database functions for workspace operations

-- Function to create a new workspace with owner
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
      WHEN p_subscription_tier = 'free' THEN ARRAY['basic_assessments']
      WHEN p_subscription_tier = 'starter' THEN ARRAY['basic_assessments', 'team_collaboration']
      WHEN p_subscription_tier = 'pro' THEN ARRAY['basic_assessments', 'team_collaboration', 'advanced_analytics', 'custom_frameworks']
      WHEN p_subscription_tier = 'enterprise' THEN ARRAY['basic_assessments', 'team_collaboration', 'advanced_analytics', 'custom_frameworks', 'sso', 'audit_logs']
      ELSE ARRAY['basic_assessments']
    END,
    jsonb_build_object(
      'max_users', CASE 
        WHEN p_subscription_tier = 'free' THEN 3
        WHEN p_subscription_tier = 'starter' THEN 10
        WHEN p_subscription_tier = 'pro' THEN 50
        WHEN p_subscription_tier = 'enterprise' THEN -1
        ELSE 3
      END,
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

-- Function to invite user to workspace
CREATE OR REPLACE FUNCTION invite_user_to_workspace(
  p_workspace_id UUID,
  p_email TEXT,
  p_role TEXT,
  p_invited_by UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
  v_user_id UUID;
  v_existing_invitation_id UUID;
BEGIN
  -- Validate inputs
  IF p_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Workspace ID cannot be null';
  END IF;
  
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RAISE EXCEPTION 'Email cannot be empty';
  END IF;
  
  IF p_role NOT IN ('viewer', 'editor', 'admin') THEN
    RAISE EXCEPTION 'Invalid role. Must be viewer, editor, or admin';
  END IF;
  
  IF p_invited_by IS NULL THEN
    RAISE EXCEPTION 'Invited by user ID cannot be null';
  END IF;

  -- Check if workspace exists
  IF NOT EXISTS (SELECT 1 FROM workspaces WHERE id = p_workspace_id) THEN
    RAISE EXCEPTION 'Workspace not found';
  END IF;

  -- Check if inviter has permission
  IF NOT EXISTS (
    SELECT 1 FROM workspace_memberships 
    WHERE workspace_id = p_workspace_id 
      AND user_id = p_invited_by 
      AND role IN ('owner', 'admin')
      AND invitation_status = 'active'
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to invite users';
  END IF;

  -- Check if user already exists
  SELECT id INTO v_user_id 
  FROM user_profiles 
  WHERE email = p_email;

  -- If user exists, check if they're already a member
  IF v_user_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM workspace_memberships 
      WHERE workspace_id = p_workspace_id 
        AND user_id = v_user_id 
        AND invitation_status IN ('active', 'pending')
    ) THEN
      RAISE EXCEPTION 'User is already a member or has a pending invitation';
    END IF;
  END IF;

  -- Check if there's already a pending invitation for this email
  SELECT id INTO v_existing_invitation_id
  FROM workspace_invitations
  WHERE workspace_id = p_workspace_id
    AND email = p_email
    AND status = 'pending'
    AND expires_at > NOW();

  -- Generate invitation token
  v_token := encode(gen_random_bytes(32), 'base64');

  -- If existing invitation, update it
  IF v_existing_invitation_id IS NOT NULL THEN
    UPDATE workspace_invitations
    SET token = v_token,
        role = p_role,
        message = p_message,
        invited_by = p_invited_by,
        invited_at = NOW(),
        expires_at = NOW() + INTERVAL '7 days',
        updated_at = NOW()
    WHERE id = v_existing_invitation_id;
  ELSE
    -- Create new invitation
    INSERT INTO workspace_invitations (
      workspace_id,
      email,
      role,
      token,
      status,
      invited_by,
      invited_at,
      expires_at,
      message,
      created_at,
      updated_at
    ) VALUES (
      p_workspace_id,
      p_email,
      p_role,
      v_token,
      'pending',
      p_invited_by,
      NOW(),
      NOW() + INTERVAL '7 days',
      p_message,
      NOW(),
      NOW()
    );
  END IF;

  RETURN v_token;
END;
$$;

-- Function to accept workspace invitation
CREATE OR REPLACE FUNCTION accept_workspace_invitation(
  p_token TEXT,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation workspace_invitations%ROWTYPE;
  v_permissions TEXT[];
BEGIN
  -- Validate inputs
  IF p_token IS NULL OR trim(p_token) = '' THEN
    RAISE EXCEPTION 'Token cannot be empty';
  END IF;
  
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;

  -- Get invitation details
  SELECT * INTO v_invitation
  FROM workspace_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > NOW();

  -- Check if invitation exists and is valid
  IF v_invitation.id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user email matches invitation email
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = p_user_id AND email = v_invitation.email
  ) THEN
    RAISE EXCEPTION 'User email does not match invitation email';
  END IF;

  -- Set permissions based on role
  v_permissions := CASE v_invitation.role
    WHEN 'viewer' THEN ARRAY['view_assessments', 'view_reports']
    WHEN 'editor' THEN ARRAY['view_assessments', 'create_assessments', 'edit_assessments', 'view_reports']
    WHEN 'admin' THEN ARRAY['view_assessments', 'create_assessments', 'edit_assessments', 'delete_assessments', 'view_reports', 'manage_team', 'manage_settings']
    ELSE ARRAY['view_assessments']
  END;

  -- Create or update workspace membership
  INSERT INTO workspace_memberships (
    workspace_id,
    user_id,
    role,
    permissions,
    invitation_status,
    invited_by,
    invited_at,
    joined_at,
    created_at,
    updated_at
  ) VALUES (
    v_invitation.workspace_id,
    p_user_id,
    v_invitation.role,
    v_permissions,
    'active',
    v_invitation.invited_by,
    v_invitation.invited_at,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (workspace_id, user_id) 
  DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    invitation_status = 'active',
    joined_at = NOW(),
    updated_at = NOW();

  -- Update invitation status
  UPDATE workspace_invitations
  SET status = 'accepted',
      accepted_at = NOW(),
      updated_at = NOW()
  WHERE id = v_invitation.id;

  -- Update user's default workspace if they don't have one
  UPDATE user_profiles 
  SET default_workspace_id = v_invitation.workspace_id,
      updated_at = NOW()
  WHERE id = p_user_id 
    AND default_workspace_id IS NULL;

  RETURN TRUE;
END;
$$;

-- Function to update workspace member role
CREATE OR REPLACE FUNCTION update_workspace_member_role(
  p_workspace_id UUID,
  p_user_id UUID,
  p_new_role TEXT,
  p_updated_by UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_permissions TEXT[];
  v_current_role TEXT;
BEGIN
  -- Validate inputs
  IF p_new_role NOT IN ('viewer', 'editor', 'admin') THEN
    RAISE EXCEPTION 'Invalid role. Must be viewer, editor, or admin';
  END IF;

  -- Check if updater has permission
  IF NOT EXISTS (
    SELECT 1 FROM workspace_memberships 
    WHERE workspace_id = p_workspace_id 
      AND user_id = p_updated_by 
      AND role IN ('owner', 'admin')
      AND invitation_status = 'active'
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to update member roles';
  END IF;

  -- Get current role
  SELECT role INTO v_current_role
  FROM workspace_memberships
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id;

  -- Prevent changing owner role
  IF v_current_role = 'owner' THEN
    RAISE EXCEPTION 'Cannot change owner role';
  END IF;

  -- Set permissions based on new role
  v_permissions := CASE p_new_role
    WHEN 'viewer' THEN ARRAY['view_assessments', 'view_reports']
    WHEN 'editor' THEN ARRAY['view_assessments', 'create_assessments', 'edit_assessments', 'view_reports']
    WHEN 'admin' THEN ARRAY['view_assessments', 'create_assessments', 'edit_assessments', 'delete_assessments', 'view_reports', 'manage_team', 'manage_settings']
  END;

  -- Update the member's role and permissions
  UPDATE workspace_memberships
  SET role = p_new_role,
      permissions = v_permissions,
      updated_at = NOW()
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id;

  RETURN FOUND;
END;
$$;

-- Function to remove workspace member
CREATE OR REPLACE FUNCTION remove_workspace_member(
  p_workspace_id UUID,
  p_user_id UUID,
  p_removed_by UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_role TEXT;
BEGIN
  -- Check if remover has permission
  IF NOT EXISTS (
    SELECT 1 FROM workspace_memberships 
    WHERE workspace_id = p_workspace_id 
      AND user_id = p_removed_by 
      AND role IN ('owner', 'admin')
      AND invitation_status = 'active'
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to remove members';
  END IF;

  -- Get member role
  SELECT role INTO v_member_role
  FROM workspace_memberships
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id;

  -- Prevent removing owner
  IF v_member_role = 'owner' THEN
    RAISE EXCEPTION 'Cannot remove workspace owner';
  END IF;

  -- Remove the member
  DELETE FROM workspace_memberships
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id;

  -- If this was user's default workspace, clear it
  UPDATE user_profiles 
  SET default_workspace_id = NULL,
      updated_at = NOW()
  WHERE id = p_user_id 
    AND default_workspace_id = p_workspace_id;

  RETURN FOUND;
END;
$$;

-- Function to get workspace usage statistics
CREATE OR REPLACE FUNCTION get_workspace_usage_stats(p_workspace_id UUID)
RETURNS TABLE(
  total_users INTEGER,
  active_users INTEGER,
  total_assessments INTEGER,
  assessments_this_month INTEGER,
  storage_used BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER 
     FROM workspace_memberships 
     WHERE workspace_id = p_workspace_id AND invitation_status = 'active') as total_users,
    
    (SELECT COUNT(*)::INTEGER 
     FROM workspace_memberships 
     WHERE workspace_id = p_workspace_id 
       AND invitation_status = 'active'
       AND last_accessed_at >= NOW() - INTERVAL '30 days') as active_users,
    
    (SELECT COUNT(*)::INTEGER 
     FROM assessments 
     WHERE workspace_id = p_workspace_id) as total_assessments,
    
    (SELECT COUNT(*)::INTEGER 
     FROM assessments 
     WHERE workspace_id = p_workspace_id 
       AND created_at >= DATE_TRUNC('month', NOW())) as assessments_this_month,
    
    -- Storage used (placeholder - would need actual storage calculation)
    0::BIGINT as storage_used;
END;
$$;

-- Function to check workspace limits
CREATE OR REPLACE FUNCTION check_workspace_limits(
  p_workspace_id UUID,
  p_limit_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_workspace workspaces%ROWTYPE;
  v_current_count INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get workspace details
  SELECT * INTO v_workspace FROM workspaces WHERE id = p_workspace_id;
  
  IF v_workspace.id IS NULL THEN
    RAISE EXCEPTION 'Workspace not found';
  END IF;

  -- Check specific limit
  CASE p_limit_type
    WHEN 'users' THEN
      v_limit := (v_workspace.limits->>'max_users')::INTEGER;
      IF v_limit = -1 THEN RETURN TRUE; END IF; -- Unlimited
      
      SELECT COUNT(*)::INTEGER INTO v_current_count
      FROM workspace_memberships 
      WHERE workspace_id = p_workspace_id AND invitation_status = 'active';
      
    WHEN 'assessments' THEN
      v_limit := (v_workspace.limits->>'max_assessments')::INTEGER;
      IF v_limit = -1 THEN RETURN TRUE; END IF; -- Unlimited
      
      SELECT COUNT(*)::INTEGER INTO v_current_count
      FROM assessments 
      WHERE workspace_id = p_workspace_id;
      
    ELSE
      RAISE EXCEPTION 'Invalid limit type: %', p_limit_type;
  END CASE;

  RETURN v_current_count < v_limit;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_workspace_with_owner TO authenticated;
GRANT EXECUTE ON FUNCTION invite_user_to_workspace TO authenticated;
GRANT EXECUTE ON FUNCTION accept_workspace_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION update_workspace_member_role TO authenticated;
GRANT EXECUTE ON FUNCTION remove_workspace_member TO authenticated;
GRANT EXECUTE ON FUNCTION get_workspace_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION check_workspace_limits TO authenticated;
