#!/usr/bin/env node

/*
  Seed a verified test user for E2E tests.

  Env vars required:
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - TEST_EMAIL (optional, default: test@example.com)
  - TEST_PASSWORD (optional, default: password123)
*/

// Load env from .env; if required vars are missing, also try .env.local
const dotenv = require('dotenv');
dotenv.config();
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  dotenv.config({ path: '.env.local' });
}
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123';

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

async function findUserByEmail(email) {
  // Paginate through users to find by email (dev environments typically small)
  const perPage = 100;
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    if (!data || !data.users || data.users.length === 0) return null;
    const found = data.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function getCustomerRoleId() {
  const { data, error } = await admin.from('roles').select('id,name').eq('name', 'Customer').maybeSingle();
  if (error) {
    console.warn('[seed-test-user] roles query error:', error.message);
    return null;
  }
  return data?.id || null;
}

async function upsertProfile(userId, email) {
  const roleId = await getCustomerRoleId();
  const payload = roleId ? { id: userId, email, role_id: roleId } : { id: userId, email };
  const { error } = await admin.from('users').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

(async () => {
  try {
    console.log('Seeding test user...');
    console.log(`Email: ${TEST_EMAIL}`);

    let user = await findUserByEmail(TEST_EMAIL);

    if (!user) {
      console.log('User not found, creating via admin API...');
      const { data, error } = await admin.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: { name: 'E2E Test User' },
      });
      if (error) {
        // If already exists race condition, try to find again
        console.warn('createUser error:', error.message);
        user = await findUserByEmail(TEST_EMAIL);
        if (!user) throw error;
      } else {
        user = data.user;
      }
    } else {
      // Ensure email is confirmed (set if not)
      if (!user.email_confirmed_at) {
        console.log('User exists but email not confirmed. Updating...');
        const { data, error } = await admin.auth.admin.updateUserById(user.id, {
          email_confirm: true,
        });
        if (error) throw error;
        user = data.user || user;
      }
      // Optionally update password to known value for tests
      const { error: pwErr } = await admin.auth.admin.updateUserById(user.id, {
        password: TEST_PASSWORD,
      });
      if (pwErr) console.warn('Warning: could not update password:', pwErr.message);
    }

    if (!user || !user.id) {
      throw new Error('Failed to obtain user id');
    }

    console.log('Upserting profile in public.users...');
    await upsertProfile(user.id, TEST_EMAIL);

    console.log('✅ Test user ready');
    console.log(JSON.stringify({ id: user.id, email: TEST_EMAIL }, null, 2));
  } catch (err) {
    console.error('❌ Failed to seed test user:', err.message);
    process.exit(1);
  }
})();
