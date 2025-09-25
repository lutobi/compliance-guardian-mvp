#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.4Vj2qZbGnzDNwJxw';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function applyMigrationAsAdmin() {
  try {
    // Create a temporary admin user
    console.log('Creating temporary admin user...');
    const email = `admin-${Date.now()}@temp.com`;
    const password = Math.random().toString(36).slice(-8);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'service_role'
        }
      }
    });

    if (authError) throw authError;
    console.log('✅ Admin user created');

    // Update user's role to service_role directly in auth.users
    console.log('\nUpdating user role...');
    const { error: roleError } = await supabase.rpc('set_claim', {
      uid: authData.user.id,
      claim: 'role',
      value: 'service_role'
    });

    if (roleError) throw roleError;
    console.log('✅ User role updated');

    // Sign in as the admin user
    console.log('\nSigning in as admin...');
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) throw signInError;
    console.log('✅ Signed in successfully');

    // Create a new client with the admin session
    const adminClient = createClient(supabaseUrl, session.access_token);

    // Read and apply migration
    console.log('\nReading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

    console.log('Applying migration...');
    const { error: sqlError } = await adminClient.rpc('exec_sql', { sql });

    if (sqlError) throw sqlError;
    console.log('✅ Migration applied successfully');

    // Clean up: Delete the temporary user
    console.log('\nCleaning up...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);

    if (deleteError) {
      console.warn('⚠️ Warning: Failed to delete temporary user:', deleteError.message);
    } else {
      console.log('✅ Temporary user deleted');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

applyMigrationAsAdmin();
