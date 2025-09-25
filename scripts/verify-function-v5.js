#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function verifyFunction() {
  try {
    // Get existing user
    const { data: users, error: getUserError } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', 'test-user@example.com')
      .single();

    let userId;
    
    if (getUserError || !users) {
      // Create new test user if not found
      const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email: 'test-user@example.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: { name: 'Test User' }
      });

      if (createError) {
        throw createError;
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: 'test-user@example.com',
          name: 'Test User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        throw profileError;
      }

      userId = profile.id;
    } else {
      userId = users.id;
    }

    console.log('✅ Using test user:', userId);

    // Try to create a workspace
    const { data: workspace, error: workspaceError } = await supabase.rpc(
      'create_workspace_with_owner',
      {
        p_user_id: userId,
        p_workspace_name: 'Test Workspace',
        p_workspace_slug: 'test-workspace-' + Date.now(),
        p_industry: 'Technology',
        p_company_size: '1-10',
        p_subscription_tier: 'free'
      }
    );

    if (workspaceError) {
      throw workspaceError;
    }

    console.log('✅ Test workspace created:', workspace);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifyFunction();
