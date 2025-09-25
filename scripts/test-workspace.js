#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function testWorkspace() {
  try {
    // Create test user
    const email = 'test-user-' + Date.now() + '@example.com';
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: 'password123',
      email_confirm: true
    });

    if (createError) throw createError;
    console.log('✅ Created test user:', user.id);

    // Create profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        email,
        name: 'Test User'
      });

    if (profileError) throw profileError;
    console.log('✅ Created user profile');

    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase.rpc(
      'create_workspace_with_owner',
      {
        p_user_id: user.id,
        p_workspace_name: 'Test Workspace',
        p_workspace_slug: 'test-' + Date.now(),
        p_industry: 'Technology',
        p_company_size: '1-10',
        p_subscription_tier: 'free'
      }
    );

    if (workspaceError) throw workspaceError;
    console.log('✅ Created workspace:', workspace);

    // Verify workspace
    const { data: workspaceData, error: getWorkspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspace)
      .single();

    if (getWorkspaceError) throw getWorkspaceError;
    console.log('✅ Verified workspace:', workspaceData);

    // Verify membership
    const { data: memberData, error: getMemberError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspace)
      .eq('user_id', user.id)
      .single();

    if (getMemberError) throw getMemberError;
    console.log('✅ Verified membership:', memberData);

    console.log('✅ All tests passed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testWorkspace();
