#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function verifyFunction() {
  try {
    // First get or create a test user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpassword123',
      email_confirm: true
    });

    if (userError && !userError.message.includes('already exists')) {
      console.error('❌ User creation error:', userError.message);
      process.exit(1);
    }

    // Get the user ID
    const { data: users, error: getUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'test@example.com')
      .single();

    if (getUserError) {
      console.error('❌ Error getting user:', getUserError.message);
      process.exit(1);
    }

    const userId = users.id;
    console.log('Using test user ID:', userId);

    // Try to call the function
    const { data, error } = await supabase.rpc('create_workspace_with_owner', {
      p_user_id: userId,
      p_workspace_name: 'Test Workspace',
      p_workspace_slug: 'test-workspace-' + Date.now(),
      p_industry: 'Technology',
      p_company_size: '1-10',
      p_subscription_tier: 'free'
    });

    if (error) {
      console.error('❌ Function error:', error.message);
      process.exit(1);
    }

    console.log('✅ Function verification successful');
    console.log('Created workspace with ID:', data);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifyFunction();
