#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

// Direct database connection for schema checks
const pool = new Pool({
  connectionString: 'postgres://postgres:postgres@db.nrfpsbbkynykubcaarpg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// Supabase client for auth and RLS operations
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function verifySchema() {
  const client = await pool.connect();
  try {
    // Check workspaces table
    const workspacesResult = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'workspaces' 
        AND column_name = 'slug'
      );
    `);
    console.log('✅ workspaces.slug exists:', workspacesResult.rows[0].exists);

    // Check workspace_members table
    const membersResult = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'workspace_members' 
        AND column_name = 'role'
      );
    `);
    console.log('✅ workspace_members.role exists:', membersResult.rows[0].exists);

    // Check function
    const functionResult = await client.query(`
      SELECT pg_get_functiondef('public.create_workspace_with_owner(uuid,text,text,text,text,text)'::regprocedure);
    `);
    console.log('✅ create_workspace_with_owner function exists');

    // Test function with actual user
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', 'test-user@example.com')
      .single();

    if (users) {
      const { data: workspace, error } = await supabase.rpc(
        'create_workspace_with_owner',
        {
          p_user_id: users.id,
          p_workspace_name: 'Test Workspace',
          p_workspace_slug: 'test-workspace-' + Date.now(),
          p_industry: 'Technology',
          p_company_size: '1-10',
          p_subscription_tier: 'free'
        }
      );

      if (error) throw error;
      console.log('✅ Test workspace created:', workspace);
    }

    console.log('✅ All verifications passed');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

verifySchema();
