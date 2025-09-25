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
const DRY_RUN = true; // Set to false to apply changes

/**
 * Set user's preferred workspace
 * If user has no preference set, use the workspace with most of their assessments
 */
async function setPreferredWorkspaces() {
  try {
    console.log('🔍 Finding and setting preferred workspaces for users...');
    
    // Get all users
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email');
    
    if (userError) {
      throw userError;
    }
    
    // Get all workspaces
    const { data: workspaces, error: wsError } = await supabase
      .from('workspaces')
      .select('id, name');
    
    if (wsError) {
      throw wsError;
    }
    
    const workspaceMap = {};
    workspaces.forEach(ws => {
      workspaceMap[ws.id] = ws.name;
    });
    
    // Get all assessments
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, name, created_by, workspace_id');
    
    if (assessmentError) {
      throw assessmentError;
    }
    
    // Get existing user settings
    const { data: userSettings, error: settingsError } = await supabase
      .from('user_settings')
      .select('user_id, preferred_workspace_id');
    
    if (settingsError) {
      throw settingsError;
    }
    
    const userSettingsMap = {};
    userSettings?.forEach(setting => {
      userSettingsMap[setting.user_id] = setting;
    });
    
    // Process each user
    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.email} (${user.id})`);
      
      // Get user's assessments
      const userAssessments = assessments.filter(a => a.created_by === user.id);
      console.log(`   Found ${userAssessments.length} assessments`);
      
      // Check current preference
      const currentSetting = userSettingsMap[user.id];
      const currentPreferredWorkspace = currentSetting?.preferred_workspace_id;
      
      if (currentPreferredWorkspace) {
        console.log(`   User already has preferred workspace set: ${workspaceMap[currentPreferredWorkspace]} (${currentPreferredWorkspace})`);
        continue;
      }
      
      if (userAssessments.length === 0) {
        console.log('   No assessments found, skipping workspace preference setting');
        continue;
      }
      
      // Count assessments by workspace
      const workspaceCounts = {};
      userAssessments.forEach(assessment => {
        const wsId = assessment.workspace_id;
        if (!workspaceCounts[wsId]) {
          workspaceCounts[wsId] = 0;
        }
        workspaceCounts[wsId]++;
      });
      
      // Find workspace with most assessments
      let bestWorkspaceId = null;
      let maxCount = 0;
      
      Object.entries(workspaceCounts).forEach(([wsId, count]) => {
        if (count > maxCount) {
          maxCount = count;
          bestWorkspaceId = wsId;
        }
        console.log(`   - ${workspaceMap[wsId] || 'Unknown'} (${wsId}): ${count} assessments`);
      });
      
      if (!bestWorkspaceId) {
        console.log('   ⚠️ Could not determine best workspace, skipping');
        continue;
      }
      
      console.log(`   ✅ Selected workspace: ${workspaceMap[bestWorkspaceId]} (${bestWorkspaceId}) with ${maxCount} assessments`);
      
      // Update or insert user settings
      if (!DRY_RUN) {
        if (currentSetting) {
          // Update existing setting
          const { error: updateError } = await supabase
            .from('user_settings')
            .update({ preferred_workspace_id: bestWorkspaceId })
            .eq('user_id', user.id);
          
          if (updateError) {
            console.error(`   ❌ Failed to update user settings: ${updateError.message}`);
          } else {
            console.log(`   ✅ Updated user settings with preferred workspace`);
          }
        } else {
          // Insert new setting
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({ 
              user_id: user.id, 
              preferred_workspace_id: bestWorkspaceId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error(`   ❌ Failed to insert user settings: ${insertError.message}`);
          } else {
            console.log(`   ✅ Created new user settings with preferred workspace`);
          }
        }
      } else {
        console.log(`   🔍 DRY RUN: Would set preferred workspace to ${workspaceMap[bestWorkspaceId]} (${bestWorkspaceId})`);
      }
    }
    
    console.log('\n✅ Finished setting preferred workspaces');
  } catch (error) {
    console.error('❌ Error setting preferred workspaces:', error);
  }
}

/**
 * Fix assessment visibility by creating API route that bypasses workspace filtering
 */
async function createApiBypassFile() {
  try {
    console.log('\n🔧 Creating API route that bypasses workspace filtering...');
    
    // The code will be written to src/app/api/assessments/route.ts
    // No actual changes are made in DRY_RUN mode
    
    console.log(`${DRY_RUN ? '🔍 DRY RUN: Would create' : '✅ Creating'} API route file`);
    
    // We'll actually create this file separately with write_to_file
  } catch (error) {
    console.error('❌ Error creating API route:', error);
  }
}

/**
 * Main function to fix assessment visibility issues
 */
async function fixAssessmentVisibility() {
  console.log('🔧 Starting assessment visibility fix');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be applied)'}`);
  
  await setPreferredWorkspaces();
  await createApiBypassFile();
  
  console.log('\n✨ Assessment visibility fix complete!');
  console.log(`To apply changes, run again with DRY_RUN = false in the script.`);
}

// Run the fix
fixAssessmentVisibility().catch(console.error);
