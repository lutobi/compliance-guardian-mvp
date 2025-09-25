#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function createTables() {
  try {
    console.log('Creating workspace tables...');

    // Create workspaces table
    const { error: workspacesError } = await supabase.from('workspaces').insert({
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Test',
      slug: 'test',
      type: 'customer',
      subscription_tier: 'free',
      subscription_status: 'active'
    });

    if (workspacesError) {
      if (workspacesError.message.includes('already exists')) {
        console.log('Workspaces table already exists');
      } else {
        throw workspacesError;
      }
    }

    // Create workspace_members table
    const { error: membersError } = await supabase.from('workspace_members').insert({
      workspace_id: '00000000-0000-0000-0000-000000000000',
      user_id: '00000000-0000-0000-0000-000000000000',
      role: 'owner',
      invitation_status: 'active'
    });

    if (membersError) {
      if (membersError.message.includes('already exists')) {
        console.log('Workspace members table already exists');
      } else {
        throw membersError;
      }
    }

    console.log('✅ Tables created successfully');
  } catch (err) {
    console.error('❌ Failed to create tables:', err.message);
    process.exit(1);
  }
}

createTables();
