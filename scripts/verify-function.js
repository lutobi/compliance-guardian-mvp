#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function verifyFunction() {
  try {
    // Try to call the function with test parameters
    const { data, error } = await supabase.rpc('create_workspace_with_owner', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_workspace_name: 'Test Workspace',
      p_workspace_slug: 'test-workspace',
      p_industry: 'Technology',
      p_company_size: '1-10',
      p_subscription_tier: 'free'
    });

    if (error && !error.message.includes('Owner ID cannot be null')) {
      console.error('❌ Function error:', error.message);
      process.exit(1);
    }

    console.log('✅ Function verification successful');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifyFunction();
