import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export async function POST() {
  console.log('========== TEAM INIT API CALLED ==========');
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('Not authenticated in team/init');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch user details and ensure workspace_id exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('workspace_id, email')
      .eq('email', session.user.email)
      .single();
    
    if (userError || !user) {
      console.error('Error fetching user data:', userError?.message || 'User not found');
      return NextResponse.json(
        { error: userError?.message || 'User not found' }, 
        { status: 500 }
      );
    }
    
    const workspaceId = user.workspace_id;
    console.log('Workspace ID found:', workspaceId);
    
    // Convert UUID to string if necessary to match the settings.workspace_id type
    // Since team_members.workspace_id is defined as text in the schema
    const workspaceIdString = workspaceId.toString();
    console.log('Using workspaceId (string format):', workspaceIdString);
    
    // First ensure settings record exists - this must be done before team_members insertion
    // due to the foreign key constraint
    const { data: existingSettings, error: settingsCheckError } = await supabase
      .from('settings')
      .select('workspace_id')
      .eq('workspace_id', workspaceIdString)
      .single();
    
    if (settingsCheckError && settingsCheckError.code !== 'PGRST116') { // Not found error is expected
      console.error('Error checking settings:', settingsCheckError);
      return NextResponse.json(
        { error: `Settings check error: ${settingsCheckError.message}` }, 
        { status: 500 }
      );
    }
    
    // If settings don't exist, create them
    if (!existingSettings) {
      console.log('Creating default settings for workspace:', workspaceIdString);
      
      const { error: createSettingsError } = await supabase
        .from('settings')
        .insert({
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
        });
      
      if (createSettingsError) {
        console.error('Error creating settings:', createSettingsError);
        return NextResponse.json(
          { error: `Failed to create settings: ${createSettingsError.message}` }, 
          { status: 500 }
        );
      }
      
      // Double-check settings were created
      const { data: verifySettings, error: verifyError } = await supabase
        .from('settings')
        .select('workspace_id')
        .eq('workspace_id', workspaceIdString)
        .single();
      
      console.log('Settings verification result:', verifySettings ? 'found' : 'not found', verifyError ? `(error: ${verifyError.message})` : '(no errors)');
        
      if (verifyError || !verifySettings) {
        console.error('Failed to verify settings creation:', verifyError);
        return NextResponse.json(
          { error: 'Settings creation could not be verified' }, 
          { status: 500 }
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
      console.error('Error checking team member count:', countError);
      return NextResponse.json(
        { error: `Team count error: ${countError.message}` }, 
        { status: 500 }
      );
    }
    
    // Only insert if no team member exists
    if (!count || count === 0) {
      console.log('No existing team member found, creating new team member.');
      console.log('Creating team member for:', user.email);
      
      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          workspace_id: workspaceIdString,
          email: user.email,
          role: 'owner',
          status: 'active',
          invited_at: new Date().toISOString(),
        });
        
      if (insertError) {
        console.error('Error inserting team member:', insertError);
        return NextResponse.json(
          { error: `Failed to create team member: ${insertError.message}` }, 
          { status: 500 }
        );
      }
    }

    console.log('========== TEAM INIT SUCCESSFUL ==========');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Unhandled error in team/init:', err);
    return NextResponse.json(
      { error: `Unhandled error: ${err.message}` }, 
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
