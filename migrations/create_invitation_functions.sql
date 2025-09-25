-- Migration: Invitation Functions
-- Purpose: Create database functions for handling invitation operations in transactions

BEGIN;

-- Function to accept a workspace invitation
CREATE OR REPLACE FUNCTION accept_workspace_invitation(
  invitation_token TEXT,
  accepting_user_id UUID,
  accepting_user_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  workspace_record RECORD;
  is_already_member BOOLEAN;
BEGIN
  -- Find the invitation by token
  SELECT * INTO invitation_record
  FROM public.workspace_invitations
  WHERE token = invitation_token
  FOR UPDATE;
  
  -- Check if invitation exists
  IF invitation_record IS NULL THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;
  
  -- Check if invitation has expired
  IF invitation_record.expires_at < NOW() THEN
    RAISE EXCEPTION 'Invitation has expired';
  END IF;
  
  -- Check if invitation has already been used
  IF invitation_record.status != 'pending' THEN
    RAISE EXCEPTION 'Invitation has already been % ', invitation_record.status;
  END IF;
  
  -- Check if invitation email matches accepting user's email
  -- Skip this check if the invitation email and accepting user's email match
  IF invitation_record.email != accepting_user_email THEN
    RAISE EXCEPTION 'Email mismatch: invitation was sent to a different email address';
  END IF;
  
  -- Check if user is already a member of this workspace
  SELECT EXISTS(
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = invitation_record.workspace_id
    AND user_id = accepting_user_id
  ) INTO is_already_member;
  
  IF is_already_member THEN
    RAISE EXCEPTION 'User is already a member of this workspace';
  END IF;
  
  -- Get workspace info
  SELECT * INTO workspace_record
  FROM public.workspaces
  WHERE id = invitation_record.workspace_id;
  
  -- Add user as a workspace member with the invited role
  INSERT INTO public.workspace_members (
    workspace_id,
    user_id,
    role,
    invited_by
  )
  VALUES (
    invitation_record.workspace_id,
    accepting_user_id,
    invitation_record.role,
    invitation_record.invited_by
  );
  
  -- Update invitation status
  UPDATE public.workspace_invitations
  SET 
    status = 'accepted',
    updated_at = NOW()
  WHERE id = invitation_record.id;
  
  -- Log the acceptance event
  INSERT INTO public.invitation_events (
    invitation_id,
    event_type,
    actor_id,
    metadata
  )
  VALUES (
    invitation_record.id,
    'invitation_accepted',
    accepting_user_id,
    jsonb_build_object(
      'workspace_id', invitation_record.workspace_id,
      'role', invitation_record.role
    )
  );
  
  -- Return workspace information
  RETURN jsonb_build_object(
    'workspace_id', workspace_record.id,
    'workspace_name', workspace_record.name,
    'workspace_slug', workspace_record.slug,
    'role', invitation_record.role
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Function to check if an invitation is valid
CREATE OR REPLACE FUNCTION validate_invitation(token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  workspace_record RECORD;
  invited_by_record RECORD;
BEGIN
  -- Find the invitation by token
  SELECT * INTO invitation_record
  FROM public.workspace_invitations
  WHERE token = token;
  
  -- Check if invitation exists
  IF invitation_record IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'Invitation not found'
    );
  END IF;
  
  -- Check if invitation has expired
  IF invitation_record.expires_at < NOW() THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'Invitation has expired'
    );
  END IF;
  
  -- Check if invitation has already been used
  IF invitation_record.status != 'pending' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'Invitation has already been ' || invitation_record.status
    );
  END IF;
  
  -- Get workspace info
  SELECT name, slug INTO workspace_record
  FROM public.workspaces
  WHERE id = invitation_record.workspace_id;
  
  -- Get inviter info
  SELECT email, first_name, last_name INTO invited_by_record
  FROM auth.users
  WHERE id = invitation_record.invited_by;
  
  -- Return invitation details if valid
  RETURN jsonb_build_object(
    'valid', true,
    'workspace_name', workspace_record.name,
    'workspace_slug', workspace_record.slug,
    'email', invitation_record.email,
    'role', invitation_record.role,
    'expires_at', invitation_record.expires_at,
    'invited_by', jsonb_build_object(
      'email', invited_by_record.email,
      'name', invited_by_record.first_name || ' ' || invited_by_record.last_name
    )
  );
END;
$$;

COMMIT;
