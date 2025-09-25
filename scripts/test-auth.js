#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', serviceKey.length);
console.log('Key starts with:', serviceKey.slice(0, 20));

const supabase = createClient(supabaseUrl, serviceKey);

async function testAuth() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    console.log('✅ Auth successful:', data);
  } catch (err) {
    console.error('❌ Auth failed:', err.message);
    process.exit(1);
  }
}

testAuth();
