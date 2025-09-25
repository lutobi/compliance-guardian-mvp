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
 * Inspect a table structure and its data
 * @param {string} tableName - Name of the table to inspect
 * @param {number} limit - Max rows to fetch
 */
async function inspectTable(tableName, limit = 5) {
  try {
    console.log(`\n===== TABLE: ${tableName} =====`);
    
    // Get columns information
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', tableName);
    
    if (columnError) {
      console.error(`Error fetching columns for ${tableName}:`, columnError);
      return;
    }
    
    console.log('\nColumns:');
    columns.forEach(col => {
      console.log(` - ${col.column_name} (${col.data_type})${col.is_nullable === 'YES' ? ' [nullable]' : ''}${col.column_default ? ` [default: ${col.column_default}]` : ''}`);
    });
    
    // Get primary key info
    const { data: primaryKeys, error: pkError } = await supabase
      .from('information_schema.key_column_usage')
      .select('column_name')
      .eq('table_name', tableName)
      .eq('constraint_name', `${tableName}_pkey`);
    
    if (!pkError && primaryKeys && primaryKeys.length > 0) {
      console.log('\nPrimary Key:', primaryKeys.map(pk => pk.column_name).join(', '));
    }
    
    // Get foreign key info
    const { data: foreignKeys, error: fkError } = await supabase
      .from('information_schema.key_column_usage')
      .select(`
        column_name,
        constraint_name,
        information_schema.table_constraints!inner(table_name, constraint_type),
        information_schema.referential_constraints!inner(referenced_table_name)
      `)
      .eq('table_name', tableName)
      .eq('information_schema.table_constraints.constraint_type', 'FOREIGN KEY');
    
    if (!fkError && foreignKeys && foreignKeys.length > 0) {
      console.log('\nForeign Keys:');
      foreignKeys.forEach(fk => {
        console.log(` - ${fk.column_name} → ${fk.information_schema.referential_constraints.referenced_table_name}`);
      });
    }
    
    // Get sample data
    const { data: rows, error: dataError } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit);
    
    if (dataError) {
      console.error(`Error fetching data for ${tableName}:`, dataError);
      return;
    }
    
    // Count total rows
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    console.log(`\nTotal Rows: ${countError ? 'Error counting rows' : count}`);
    
    if (rows && rows.length > 0) {
      console.log(`\nSample Data (${Math.min(rows.length, limit)} rows):`);
      console.log(JSON.stringify(rows, null, 2));
    } else {
      console.log('\nNo data found in this table.');
    }
  } catch (error) {
    console.error(`Error inspecting table ${tableName}:`, error);
  }
}

/**
 * Check relationships between assessments and users/workspaces
 */
async function analyzeAssessmentRelationships() {
  try {
    console.log('\n\n===== ASSESSMENT RELATIONSHIPS ANALYSIS =====');
    
    // Get all users
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(100);
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return;
    }
    
    console.log(`\nFound ${users.length} users`);
    
    // Get assessment counts by user
    console.log('\nAssessments By User (created_by):');
    for (const user of users) {
      const { count, error: countError } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);
      
      if (!countError) {
        console.log(` - ${user.email}: ${count} assessments`);
      }
    }
    
    // Get workspaces
    const { data: workspaces, error: wsError } = await supabase
      .from('workspaces')
      .select('id, name, customer_id')
      .limit(100);
    
    if (wsError) {
      console.error('Error fetching workspaces:', wsError);
      return;
    }
    
    console.log(`\nFound ${workspaces.length} workspaces`);
    
    // Get assessment counts by workspace
    console.log('\nAssessments By Workspace:');
    for (const ws of workspaces) {
      const { count, error: countError } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', ws.id);
      
      if (!countError) {
        console.log(` - ${ws.name} (${ws.id}): ${count} assessments`);
      }
    }
    
    // Get user preferred workspaces
    console.log('\nUser Preferred Workspaces:');
    for (const user of users) {
      const { data: userSettings, error: settingsError } = await supabase
        .from('user_settings')
        .select('preferred_workspace_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!settingsError) {
        const workspaceId = userSettings?.preferred_workspace_id;
        const workspace = workspaces.find(ws => ws.id === workspaceId);
        console.log(` - ${user.email}: ${workspace ? workspace.name : 'No preferred workspace set'} (${workspaceId || 'null'})`);
      }
    }
    
  } catch (error) {
    console.error('Error analyzing assessment relationships:', error);
  }
}

/**
 * Main function to inspect the database schema
 */
async function inspectDatabase() {
  try {
    // Key tables to inspect
    const tables = [
      'assessments',
      'workspaces',
      'users',
      'user_settings',
      'compliance_checks',
      'documents',
      'risk_assessments',
      'verifications'
    ];
    
    for (const table of tables) {
      await inspectTable(table);
    }
    
    // Analyze relationships specifically
    await analyzeAssessmentRelationships();
    
    console.log('\n===== INSPECTION COMPLETE =====');
  } catch (error) {
    console.error('Error during database inspection:', error);
  }
}

// Run the inspection
inspectDatabase().catch(console.error);
