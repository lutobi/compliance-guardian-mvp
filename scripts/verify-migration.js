#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function verifyMigration() {
  try {
    // Check tables
    console.log('Checking tables...');
    
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('*')
      .limit(1);
    
    if (workspacesError) throw new Error(`workspaces table error: ${workspacesError.message}`);
    console.log('✅ workspaces table exists');

    const { data: members, error: membersError } = await supabase
      .from('workspace_members')
      .select('*')
      .limit(1);
    
    if (membersError) throw new Error(`workspace_members table error: ${membersError.message}`);
    console.log('✅ workspace_members table exists');

    // Check function
    console.log('\nChecking function...');
    const { data: functions, error: functionsError } = await supabase
      .rpc('create_workspace_with_owner', {
        p_workspace_name: 'Test Workspace',
        p_workspace_slug: 'test-workspace-' + Date.now(),
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_workspace_type: 'team',
        p_subscription_tier: 'free'
      });

    if (functionsError && !functionsError.message.includes('Owner ID cannot be null')) {
      throw new Error(`Function error: ${functionsError.message}`);
    }
    console.log('✅ create_workspace_with_owner function exists');

    console.log('\n✅ Migration verification successful');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifyMigration();
