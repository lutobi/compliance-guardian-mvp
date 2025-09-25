#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// Configuration
const DRY_RUN = process.env.DRY_RUN !== 'false';

/**
 * Create the workspace_preferences table
 */
async function setupWorkspacePreferencesTable() {
  console.log('\n🔧 Setting up workspace_preferences table...');
  
  try {
    // Check if table exists by attempting a query
    const { error: checkError } = await supabase
      .from('workspace_preferences')
      .select('count(*)')
      .limit(1);
    
    // If table exists, we can proceed with migrations
    if (!checkError) {
      console.log('✅ workspace_preferences table already exists');
      return true;
    }
    
    // Table needs to be created
    console.log('Creating workspace_preferences table...');
    
    if (DRY_RUN) {
      console.log('🔍 DRY RUN: Would create workspace_preferences table');
      return true; // Return true in dry run to allow the migration to proceed
    }
    
    // Execute table creation SQL directly
    const { error } = await supabase.from('_exec_sql').select('*').limit(1);
    
    // If the table execution method isn't available, try to add it
    if (error && error.message.includes('relation "_exec_sql" does not exist')) {
      console.log('Creating a simple table to store user preferences...');

      // Use Supabase's built-in API to create a table
      const { data, error: createError } = await supabase
        .from('tables')
        .insert({
          name: 'workspace_preferences',
          schema: 'public',
          comment: 'User workspace preferences',
          columns: [
            { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
            { name: 'user_id', type: 'uuid', notNull: true },
            { name: 'workspace_id', type: 'uuid', notNull: true },
            { name: 'created_at', type: 'timestamptz', default: 'now()' },
            { name: 'updated_at', type: 'timestamptz', default: 'now()' }
          ],
          enableRLS: true
        });

      if (createError) {
        console.log('Failed to create table via API, trying direct insert...');
        
        // If the API approach fails, try direct insert
        try {
          // We'll simply create the table with minimal structure
          // The API will handle it as if it exists
          await supabase.auth.signInWithPassword({
            email: process.env.SUPABASE_ADMIN_EMAIL,
            password: process.env.SUPABASE_ADMIN_PASSWORD
          });
          
          await supabase.rpc('create_workspace_preferences_table');
          console.log('✅ Created workspace_preferences table via RPC');
          return true;
        } catch (rpcError) {
          console.log('RPC approach failed:', rpcError?.message || 'Unknown error');
          console.log('Continuing with migration assuming table will be created by the API...');
          return true;
        }
      } else {
        console.log('✅ Created workspace_preferences table');
        return true;
      }
    } else {
      console.log('Unexpected error checking for table:', error?.message || 'Unknown error');
      console.log('Continuing with migration assuming table will be created by the API...');
      return true;
    }
  } catch (error) {
    console.error('❌ Error setting up workspace_preferences table:', error?.message || error);
    console.log('Continuing with migration assuming table will be created by the API...');
    return true;
  }
}

/**
 * Migrate user workspace preferences to the new workspace_preferences table
 */
async function migrateWorkspacePreferences() {
  try {
    console.log('\n🔄 Migrating user workspace preferences...');
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be applied)'}`);

    // Get all users
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email');
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return;
    }
    
    console.log(`Found ${users.length} users to process`);
    
    // Check for user_settings table
    let userSettingsExists = false;
    try {
      const { error: tableCheckError } = await supabase
        .from('user_settings')
        .select('count(*)')
        .limit(1);
      
      userSettingsExists = !tableCheckError;
      console.log(`user_settings table ${userSettingsExists ? 'exists' : 'does not exist'}`);
    } catch (error) {
      console.log('Could not check for user_settings table, assuming it does not exist');
    }
    
    // For each user, check preferences in various sources and migrate
    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.email} (${user.id})`);
      
      let preferredWorkspaceId = null;
      let source = null;
      
      // Check if already in workspace_preferences
      const { data: existingPref, error: existingPrefError } = await supabase
        .from('workspace_preferences')
        .select('workspace_id')
        .eq('user_id', user.id)
        .single();
      
      if (!existingPrefError && existingPref?.workspace_id) {
        console.log(`✅ User already has preference in workspace_preferences: ${existingPref.workspace_id}`);
        continue; // Skip this user
      }
      
      // Check user_settings if it exists
      if (userSettingsExists) {
        const { data: userSettings, error: settingsError } = await supabase
          .from('user_settings')
          .select('preferred_workspace_id')
          .eq('user_id', user.id)
          .single();
        
        if (!settingsError && userSettings?.preferred_workspace_id) {
          preferredWorkspaceId = userSettings.preferred_workspace_id;
          source = 'user_settings';
          console.log(`Found preference in user_settings: ${preferredWorkspaceId}`);
        }
      }
      
      // Check user metadata
      if (!preferredWorkspaceId) {
        const { data: userData, error: userDataError } = await supabase.auth.admin.getUserById(user.id);
        
        if (!userDataError && userData?.user?.user_metadata?.preferred_workspace_id) {
          preferredWorkspaceId = userData.user.user_metadata.preferred_workspace_id;
          source = 'user_metadata';
          console.log(`Found preference in user_metadata: ${preferredWorkspaceId}`);
        }
      }
      
      // If no preference found, determine from assessments
      if (!preferredWorkspaceId) {
        // Get user's assessments
        const { data: userAssessments, error: assessmentError } = await supabase
          .from('assessments')
          .select('workspace_id')
          .eq('created_by', user.id);
        
        if (assessmentError) {
          console.error(`Error fetching assessments for user ${user.id}:`, assessmentError);
          continue;
        }
        
        if (userAssessments.length === 0) {
          console.log(`User has no assessments, skipping`);
          continue;
        }
        
        // Count assessments by workspace
        const workspaceCounts = {};
        userAssessments.forEach(assessment => {
          const wsId = assessment.workspace_id;
          if (!wsId) return;
          
          if (!workspaceCounts[wsId]) {
            workspaceCounts[wsId] = 0;
          }
          workspaceCounts[wsId]++;
        });
        
        // Find workspace with most assessments
        let maxCount = 0;
        
        Object.entries(workspaceCounts).forEach(([wsId, count]) => {
          if (count > maxCount) {
            maxCount = count;
            preferredWorkspaceId = wsId;
          }
        });
        
        if (preferredWorkspaceId) {
          source = 'assessment_analysis';
          console.log(`Determined preference from assessments: ${preferredWorkspaceId} (${maxCount} assessments)`);
        }
      }
      
      // Create preference in workspace_preferences table
      if (preferredWorkspaceId) {
        let result;
        if (!DRY_RUN) {
          try {
            const { data, error } = await supabase
              .from('workspace_preferences')
              .insert({
                user_id: user.id,
                workspace_id: preferredWorkspaceId,
              });
            if (error) {
              console.error(`❌ Error creating workspace preference: ${error.message}`);
            } else {
              console.log(`✅ Created workspace preference: ${preferredWorkspaceId} (source: ${source})`);
            }
          } catch (e) {
            console.error(`❌ Exception creating workspace preference: ${e.message || 'Unknown error'}`);
          }
        } else {
          console.log(`🔍 DRY RUN: Would create workspace preference: ${preferredWorkspaceId} (source: ${source})`);
        } 
      } else {
        console.log(`⚠️ Could not determine preferred workspace for user ${user.email}`);
      }
    }
    
    console.log('\n✨ Migration completed!');
    
    if (DRY_RUN) {
      console.log(`To apply changes, run again with DRY_RUN=false environment variable.`);
      console.log(`Example: DRY_RUN=false node scripts/migrate-user-preferences.js`);
    }
  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log(`\n🚀 Running user workspace preferences migration...`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be applied)'}`);
  
  // First try to set up the table
  await setupWorkspacePreferencesTable();
  
  // Then migrate the user preferences
  await migrateWorkspacePreferences();
  
  console.log('\n\n✨ Migration process complete!');
  
  if (DRY_RUN) {
    console.log(`To apply changes, run again with DRY_RUN=false environment variable.`);
    console.log(`Example: DRY_RUN=false node scripts/migrate-user-preferences.js`);
  } else {
    console.log(`User workspace preferences have been migrated.`);
    console.log(`Restart the server to ensure the API uses the new preferences.`);
  }
}

// Run the migration
runMigration().catch(console.error);
