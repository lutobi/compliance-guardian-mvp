/*
 Fast API-only test for workspace switch without a browser.
 1) Seed test user/workspace
 2) Sign in with Supabase (email/password)
 3) POST /api/auth/callback to set server cookies; capture Set-Cookie
 4) Call /api/workspace/switch with Cookie header and verify 200

 Usage:
   node scripts/e2e/workspace-switch.api.js --baseUrl http://localhost:3000 --seedToken dev-seed
*/

const assert = require('assert');
const { URL } = require('url');
const { createClient } = require('@supabase/supabase-js');
// Load env from .env.local (Next.js convention) or fallback to .env
try {
  const dotenv = require('dotenv');
  // Try .env.local first
  const resLocal = dotenv.config({ path: '.env.local' });
  if (resLocal.error) {
    dotenv.config();
  }
} catch {}

function getArg(name, def) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return def;
}

const BASE_URL = getArg('baseUrl', 'http://localhost:3000');
const SEED_TOKEN = getArg('seedToken', process.env.TEST_SEED_TOKEN || 'dev-seed');
const TEST_EMAIL = getArg('email', `e2e_api_${Date.now()}@example.test`);
const TEST_PASSWORD = getArg('password', 'Password123!');

async function seedTestUser() {
  const res = await fetch(new URL('/api/test/seed-user', BASE_URL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-seed-token': SEED_TOKEN,
    },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Seed failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  assert(json.ok, 'Seed response not ok');
  return json;
}

function extractCookieHeaderFromSetCookie(setCookies) {
  if (!setCookies) return '';
  const list = Array.isArray(setCookies) ? setCookies : [setCookies];
  const pairs = [];
  for (const sc of list) {
    if (!sc) continue;
    const first = sc.split(';')[0];
    if (first && first.includes('=')) pairs.push(first.trim());
  }
  return pairs.join('; ');
}

async function run() {
  console.log('[API] Seeding test user/workspace...');
  const seed = await seedTestUser();
  const { workspace, user } = seed;
  console.log('[API] Seeded workspace:', workspace);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anon) {
    console.error('[API] Env diagnostics:', {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      loadedFromEnvLocal: !!process.env.NEXT_PUBLIC_SUPABASE_URL || !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  console.log('[API] Signing in to Supabase...');
  const supabase = createClient(supabaseUrl, anon, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });
  if (error) throw error;
  const session = data.session;
  assert(session?.access_token && session?.refresh_token, 'Missing session tokens');

  console.log('[API] Syncing cookies via /api/auth/callback');
  const cbRes = await fetch(new URL('/api/auth/callback', BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'SIGNED_IN', session }),
    redirect: 'manual',
  });
  if (!cbRes.ok) {
    const t = await cbRes.text();
    throw new Error(`/api/auth/callback failed: ${cbRes.status} ${t}`);
  }
  // Get Set-Cookie headers (Node/undici provides getSetCookie)
  const setCookies = cbRes.headers.getSetCookie ? cbRes.headers.getSetCookie() : cbRes.headers.get('set-cookie');
  const cookieHeader = extractCookieHeaderFromSetCookie(setCookies);
  if (!cookieHeader) throw new Error('No cookies set by /api/auth/callback');
  console.log('[API] Received cookies:', cookieHeader.split('; ').map(p => p.split('=')[0]).join(', '));

  console.log('[API] POST /api/workspace/switch');
  const swRes = await fetch(new URL('/api/workspace/switch', BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
    body: JSON.stringify({ workspaceSlug: workspace.slug }),
    redirect: 'manual',
  });
  if (!swRes.ok) {
    const t = await swRes.text();
    throw new Error(`/api/workspace/switch failed: ${swRes.status} ${t}`);
  }
  const swJson = await swRes.json();
  assert(swJson.success === true, 'Switch did not return success=true');

  console.log('[API] SUCCESS: workspace switch returned 200 and success=true');
}

run().catch((err) => {
  console.error('[API] FAILED:', err);
  process.exitCode = 1;
});
