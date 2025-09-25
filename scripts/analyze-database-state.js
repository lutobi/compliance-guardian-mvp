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

/**
 * Get schema information for a table by examining a sample row
 */
async function getTableSchema(tableName, limit = 1) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit);
    
    if (error) {
      console.error(`Error fetching schema for ${tableName}:`, error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log(`No data found in ${tableName} to infer schema`);
      return null;
    }
    
    // Infer schema from first row
    const sample = data[0];
    const schema = {};
    
    for (const [key, value] of Object.entries(sample)) {
      schema[key] = {
        type: typeof value,
        sample: value,
        nullable: value === null
      };
    }
    
    return schema;
  } catch (error) {
    console.error(`Error analyzing schema for ${tableName}:`, error);
    return null;
  }
}

/**
 * Examine assessment data in detail
 */
async function analyzeAssessments() {
  try {
    console.log('\n===== ASSESSMENT ANALYSIS =====');
    
    // Get all assessments
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessments')
      .select('*');
    
    if (assessmentError) {
      console.error('Error fetching assessments:', assessmentError);
      return;
    }
    
    console.log(`\nTotal Assessments: ${assessments.length}`);
    
    // Show assessment schema
    const schema = await getTableSchema('assessments');
    if (schema) {
      console.log('\nAssessment Schema:');
      for (const [column, info] of Object.entries(schema)) {
        console.log(` - ${column} (${info.type})${info.nullable ? ' [nullable]' : ''}`);
      }
    }
    
    // Count assessments by name to find duplicates
    const assessmentsByName = {};
    assessments.forEach(assessment => {
      const name = assessment.name || 'Unnamed';
      if (!assessmentsByName[name]) {
        assessmentsByName[name] = [];
      }
      assessmentsByName[name].push(assessment);
    });
    
    const duplicateSets = Object.entries(assessmentsByName)
      .filter(([_, list]) => list.length > 1);
    
    console.log(`\nFound ${duplicateSets.length} assessment names with duplicates`);
    console.log(`Total duplicate instances: ${duplicateSets.reduce((acc, [_, list]) => acc + list.length - 1, 0)}`);
    
    // Get users for reference
    const { data: users } = await supabase
      .from('users')
      .select('id, email');
    
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user.email;
    });
    
    // Get workspaces for reference
    const { data: workspaces } = await supabase
      .from('workspaces')
      .select('*');
    
    const workspaceMap = {};
    workspaces.forEach(ws => {
      workspaceMap[ws.id] = ws.name;
    });
    
    console.log('\nWorkspaces:');
    workspaces.forEach(ws => {
      console.log(` - ${ws.id}: ${ws.name}`);
    });
    
    // Get user preferred workspaces
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('*');
    
    const userWorkspaceMap = {};
    userSettings?.forEach(setting => {
      if (setting.preferred_workspace_id) {
        userWorkspaceMap[setting.user_id] = setting.preferred_workspace_id;
      }
    });
    
    console.log('\nUser Preferred Workspaces:');
    Object.entries(userWorkspaceMap).forEach(([userId, workspaceId]) => {
      console.log(` - ${userMap[userId] || userId}: ${workspaceMap[workspaceId] || workspaceId}`);
    });
    
    // Analyze assessments by user
    const assessmentsByUser = {};
    assessments.forEach(assessment => {
      const userId = assessment.created_by;
      if (!assessmentsByUser[userId]) {
        assessmentsByUser[userId] = [];
      }
      assessmentsByUser[userId].push(assessment);
    });
    
    console.log('\nAssessments by User:');
    Object.entries(assessmentsByUser).forEach(([userId, userAssessments]) => {
      const email = userMap[userId] || userId;
      console.log(`\n - ${email} (${userId}): ${userAssessments.length} assessments`);
      
      // Check workspace alignment
      const preferredWorkspace = userWorkspaceMap[userId];
      const assessmentsByWorkspace = {};
      
      userAssessments.forEach(assessment => {
        const wsId = assessment.workspace_id || 'none';
        if (!assessmentsByWorkspace[wsId]) {
          assessmentsByWorkspace[wsId] = 0;
        }
        assessmentsByWorkspace[wsId]++;
      });
      
      console.log(`   Preferred workspace: ${workspaceMap[preferredWorkspace] || 'None'} (${preferredWorkspace || 'null'})`);
      console.log('   Assessments by workspace:');
      Object.entries(assessmentsByWorkspace).forEach(([wsId, count]) => {
        const wsName = workspaceMap[wsId] || 'Unknown';
        const isPreferred = wsId === preferredWorkspace ? '✓' : '✗';
        console.log(`    - ${wsName} (${wsId}): ${count} assessments ${isPreferred}`);
      });
      
      // List specific assessments with workspace info
      console.log('   Assessment details:');
      userAssessments.slice(0, 5).forEach(assessment => {
        const wsName = workspaceMap[assessment.workspace_id] || 'Unknown';
        console.log(`    - "${assessment.name}" in ${wsName} (created: ${new Date(assessment.created_at).toLocaleDateString()})`);
      });
      if (userAssessments.length > 5) {
        console.log(`    ... and ${userAssessments.length - 5} more assessments`);
      }
    });
    
    // Check if other tables reference assessments properly
    console.log('\nRelated Table References:');
    
    // Check compliance_checks
    const { data: checks, error: checksError } = await supabase
      .from('compliance_checks')
      .select('assessment_id')
      .limit(1);
    
    if (!checksError) {
      console.log(` - compliance_checks has assessment_id field: ${!!checks}`);
    }
    
    // Check risk_assessments
    const { data: risks, error: risksError } = await supabase
      .from('risk_assessments')
      .select('assessment_id')
      .limit(1);
    
    if (!risksError) {
      console.log(` - risk_assessments has assessment_id field: ${!!risks}`);
    }
    
    // Check verifications
    const { data: verifications, error: verificationsError } = await supabase
      .from('verifications')
      .select('assessment_id')
      .limit(1);
    
    if (!verificationsError) {
      console.log(` - verifications has assessment_id field: ${!!verifications}`);
    }
    
    // Check documents
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('assessment_id')
      .limit(1);
    
    if (!documentsError) {
      console.log(` - documents has assessment_id field: ${!!documents}`);
    } else {
      const { data: docSample } = await supabase.from('documents').select('*').limit(1);
      if (docSample && docSample.length > 0) {
        console.log(' - documents fields:', Object.keys(docSample[0]).join(', '));
      }
    }
  } catch (error) {
    console.error('Error analyzing assessments:', error);
  }
}

/**
 * Main function
 */
async function analyzeDatabase() {
  try {
    await analyzeAssessments();
    console.log('\n===== ANALYSIS COMPLETE =====');
  } catch (error) {
    console.error('Error during database analysis:', error);
  }
}

// Run the analysis
analyzeDatabase().catch(console.error);
