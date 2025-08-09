import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';
import {
  WorkspaceSettings,
  WorkspaceSettingsInsert,
  TeamMemberInsert,
  normalizeWorkspaceId,
  validateSettingsPayload,
  validateTeamMemberPayload
} from '@/lib/schema/settings';
import {
  createSuccessResponse,
  createErrorResponse,
  handleDatabaseError,
  handleValidationError,
  handleAuthError,
  log
} from '@/lib/services/errorHandler';
import {
  getServerSupabase,
  requireAuthentication
} from '@/lib/services/authService';

export async function POST() {
  log('info', '========== TEAM INIT API CALLED ==========');
  try {
    // Verify authentication using our auth service
    const { authenticated, error: authError, userId } = await requireAuthentication();
    if (!authenticated || authError) {
      log('warn', 'Authentication failed in team/init', { error: authError?.message });
      return handleAuthError('Authentication required to initialize team');
    }
    
    // Initialize Supabase client from our service
    const supabase = getServerSupabase();

    // Fetch user details and ensure workspace_id exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('workspace_id, email')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      log('error', 'Error fetching user data', { 
        error: userError?.message || 'User not found',
        userId 
      });
      return handleDatabaseError(
        userError || new Error('User not found'),
        'fetching user profile'
      );
    }
    
    const workspaceId = user.workspace_id;
    log('info', 'Workspace ID found', { workspaceId });
    
    // Normalize workspace ID to ensure consistent string format using our utility
    const workspaceIdString = normalizeWorkspaceId(workspaceId);
    if (!workspaceIdString) {
      log('error', 'Invalid workspace ID format', { workspaceId });
      return handleValidationError(['workspace_id'], 'workspace ID');
    }
    log('info', 'Using normalized workspaceId', { workspaceIdString });
    
    // First ensure settings record exists - this must be done before team_members insertion
    // due to the foreign key constraint
    const { data: existingSettings, error: settingsCheckError } = await supabase
      .from('settings')
      .select('workspace_id')
      .eq('workspace_id', workspaceIdString)
      .single();
    
    if (settingsCheckError && settingsCheckError.code !== 'PGRST116') { // Not found error is expected
      log('error', 'Error checking settings', { error: settingsCheckError });
      return handleDatabaseError(settingsCheckError, 'checking workspace settings');
    }
    
    // If settings don't exist, create them
    if (!existingSettings) {
      log('info', 'Creating default settings for workspace', { workspaceId: workspaceIdString });
      
      // Create settings payload using our schema type
      const settingsPayload: WorkspaceSettingsInsert = {
        workspace_id: workspaceIdString,
        workspace_name: `Workspace ${workspaceIdString.substring(0, 6)}`,
        default_compliance_framework: 'EUDR',
        locale: 'en-US',
        timezone: 'UTC',
        date_format: 'yyyy-MM-dd',
        time_format: '24h',
        notifications_enabled: true,
        compliance_frequency: 'monthly',
        notification_threshold: 7
      };
      
      // Validate the settings payload against our schema
      const missingFields = validateSettingsPayload(settingsPayload);
      if (missingFields.length > 0) {
        log('error', 'Invalid settings payload', { missingFields });
        return handleValidationError(missingFields, 'workspace settings');
      }
      
      const { error: createSettingsError } = await supabase
        .from('settings')
        .insert(settingsPayload);
      
      if (createSettingsError) {
        log('error', 'Error creating settings', { error: createSettingsError });
        return handleDatabaseError(createSettingsError, 'creating workspace settings');
      }
      
      // Double-check settings were created
      const { data: verifySettings, error: verifyError } = await supabase
        .from('settings')
        .select('workspace_id')
        .eq('workspace_id', workspaceIdString)
        .single();
      
      log('info', 'Settings verification result', { 
        found: !!verifySettings,
        error: verifyError ? verifyError.message : null
      });
        
      if (verifyError || !verifySettings) {
        log('error', 'Failed to verify settings creation', { error: verifyError });
        return handleDatabaseError(
          verifyError || new Error('Settings creation could not be verified'),
          'verifying settings creation'
        );
      }
    }
    
    // Check if team member already exists
    const { count, error: countError } = await supabase
      .from('team_members')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceIdString)
      .eq('email', user.email);
      
    if (countError) {
      log('error', 'Error checking team member count', { error: countError });
      return handleDatabaseError(countError, 'checking existing team members');
    }
    
    // Only insert if no team member exists
    if (!count || count === 0) {
      log('info', 'No existing team member found, creating new team member', { email: user.email });
      
      // Create team member payload using our schema type
      const teamMemberPayload: TeamMemberInsert = {
        workspace_id: workspaceIdString,
        email: user.email,
        role: 'owner',
        status: 'active'
      };
      
      // Validate team member payload against our schema
      const missingFields = validateTeamMemberPayload(teamMemberPayload);
      if (missingFields.length > 0) {
        log('error', 'Invalid team member payload', { missingFields });
        return handleValidationError(missingFields, 'team member');
      }
      
      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          ...teamMemberPayload,
          invited_at: new Date().toISOString(),
        });
        
      if (insertError) {
        log('error', 'Error inserting team member', { error: insertError });
        return handleDatabaseError(insertError, 'creating team member');
      }
    }

    log('info', '========== TEAM INIT SUCCESSFUL ==========');
    return createSuccessResponse({ initialized: true });
  } catch (err: any) {
    log('error', 'Unhandled error in team/init', { error: err });
    return createErrorResponse(
      `Unhandled error during team initialization: ${err.message}`,
      500,
      'api',
      'UNHANDLED_ERROR'
    );
  }
}

export const runtime = 'nodejs';
