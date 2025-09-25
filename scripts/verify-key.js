#!/usr/bin/env node

const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  dotenv.config({ path: '.env.local' });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('Service Role Key Analysis:');
console.log('-------------------------');

// Parse and verify JWT format
try {
  const [header, payload, signature] = serviceKey.split('.');
  const decodedHeader = JSON.parse(Buffer.from(header, 'base64').toString());
  const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());

  console.log('JWT Header:', decodedHeader);
  console.log('JWT Payload:', decodedPayload);
  console.log('JWT appears to be valid');

  // Extract project ref from URL
  const projectRef = supabaseUrl.match(/https:\/\/(.*?)\.supabase\.co/)[1];
  console.log('\nProject Reference:', projectRef);
  
  if (decodedPayload.ref !== projectRef) {
    console.error('❌ Warning: JWT project ref does not match URL project ref');
  }

  // Check role
  if (decodedPayload.role !== 'service_role') {
    console.error('❌ Warning: JWT role is not service_role');
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (decodedPayload.exp < now) {
    console.error('❌ Warning: JWT is expired');
  }
} catch (err) {
  console.error('❌ Error parsing JWT:', err.message);
  process.exit(1);
}

// Test key with Supabase client
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function testKey() {
  try {
    console.log('\nTesting key with Supabase client...');

    // Try to list users (requires service role)
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      throw new Error(`Admin API failed: ${usersError.message}`);
    }
    console.log('✅ Admin API access successful');

    // Try to query a table
    const { data: test, error: testError } = await supabase
      .from('_migrations')
      .select('*')
      .limit(1);
    
    if (testError) {
      throw new Error(`Database query failed: ${testError.message}`);
    }
    console.log('✅ Database access successful');

  } catch (err) {
    console.error('❌ Key verification failed:', err.message);
    process.exit(1);
  }
}

testKey();
