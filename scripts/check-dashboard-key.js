#!/usr/bin/env node

const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load env vars
dotenv.config();
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  dotenv.config({ path: '.env.local' });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Current Service Role Key:', serviceKey);
console.log('\nTo verify this key:');
console.log('1. Go to https://supabase.com/dashboard/project/nrfpsbbkynykubcaarpg/settings/api');
console.log('2. Compare with the service_role key shown there');
console.log('3. If different, update the SUPABASE_SERVICE_ROLE_KEY in your .env file');
