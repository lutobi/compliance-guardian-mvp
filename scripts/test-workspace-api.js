#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const testEmail = process.env.TEST_EMAIL || 'test@example.com';
const testPassword = process.env.TEST_PASSWORD || 'password123';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

async function testWorkspaceCreation() {
  try {
    console.log('Testing workspace creation API...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Test email:', testEmail);

    // Sign in test user
    console.log('\nSigning in test user...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (authError) {
      throw new Error(`Auth failed: ${authError.message}`);
    }

    const session = data.session;
    if (!session?.access_token) {
      throw new Error('No access token in response');
    }

    console.log('Got access token:', session.access_token.slice(0, 20) + '...');
    console.log('User ID:', session.user.id);

    // Start Next.js dev server if not running
    const devServer = require('child_process').spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      detached: true
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\nSending workspace creation request...');
    const response = await fetch('http://localhost:3007/api/team/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        workspaceName: 'Test Workspace',
        workspaceSlug: 'test-workspace',
        industry: 'technology',
        companySize: '1-10'
      })
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
      console.log('\nAPI Response:', JSON.stringify(result, null, 2));

      if (!result.success) {
        console.error('API call failed:', result.error);
        process.exit(1);
      }
    } catch (err) {
      console.error('Failed to parse response:', text);
      process.exit(1);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testWorkspaceCreation();
