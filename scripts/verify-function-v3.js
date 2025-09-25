#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function verifyFunction() {
  try {
    // Create test user with verified email
    const email = 'test-user@example.com';
    const password = 'password123';
    
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: 'Test User' }
    });

    if (createError && !createError.message.includes('already exists')) {
      throw createError;
    }

    // Get or create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user?.id,
        email,
        name: 'Test User',
        role: 'Customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      throw profileError;
    }

    console.log('✅ Test user ready:', profile.id);

    // Try to create a workspace
    const { data: workspace, error: workspaceError } = await supabase.rpc(
      'create_workspace_with_owner',
      {
        p_user_id: profile.id,
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
