#!/usr/bin/env node

const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

dotenv.config();
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  dotenv.config({ path: '.env.local' });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a temporary Edge Function to apply the migration
const migrationFunction = `
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const { sql } = await req.json()
    
    // Execute SQL directly using service role
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) throw error
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
`;

async function createEdgeFunction() {
  try {
    console.log('Creating Edge Function...');
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Create a temporary function
    const { data: func, error: funcError } = await supabase.functions.create({
      name: 'apply-migration',
      body: migrationFunction,
      verify_jwt: false
    });

    if (funcError) throw funcError;
    console.log('✅ Edge Function created');

    // Read migration SQL
    console.log('\nReading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

    // Call the function
    console.log('Applying migration...');
    const response = await fetch(`${supabaseUrl}/functions/v1/apply-migration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    console.log('✅ Migration applied successfully');

    // Clean up
    console.log('\nCleaning up...');
    await supabase.functions.delete('apply-migration');
    console.log('✅ Edge Function deleted');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createEdgeFunction();
