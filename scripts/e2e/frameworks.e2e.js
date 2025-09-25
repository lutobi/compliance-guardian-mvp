/*
 E2E: Frameworks sanity (evidence + monitoring GETs for multiple frameworks)

 Usage:
   TEST_EMAIL="you@example.com" TEST_PASSWORD="yourpass" node scripts/e2e/frameworks.e2e.js
*/

const { createClient } = require('@supabase/supabase-js');
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
  dotenv.config();
} catch {}

const ORIGIN = process.env.E2E_ORIGIN || 'http://localhost:3002';
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;
let WORKSPACE_SLUG = process.env.TEST_WORKSPACE_SLUG || 'abimbolatobi-gmail-com-s-workspace';

// Test a set of frameworks (slugs or UUIDs)
const FRAMEWORKS = (
  process.env.TEST_FRAMEWORKS || '84fe5672-eb4b-405c-a913-19f956fbe256,nist-800-171,cmmc,eudr,iso-27001'
).split(',');

if (!EMAIL || !PASSWORD) {
  console.error('[E2E:FW] Missing TEST_EMAIL or TEST_PASSWORD env vars');
  process.exit(1);
}

(async () => {
  try {
    // Seed
    try {
      const res = await fetch(`${ORIGIN}/api/test/seed-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-seed-token': 'dev-seed' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        console.warn('[E2E:FW] Seed failed (continuing):', res.status, json);
      } else if (json?.workspace?.slug) {
        WORKSPACE_SLUG = json.workspace.slug;
      }
    } catch (e) {
      console.warn('[E2E:FW] Seed error (continuing):', e?.message || e);
    }

    // Sign in for token
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
    if (signInErr || !signInData?.session?.access_token) throw new Error('Failed to sign in');
    const token = signInData.session.access_token;

    // Switch workspace
    await fetch(`${ORIGIN}/api/workspace/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-e2e': '1' },
      body: JSON.stringify({ workspaceSlug: WORKSPACE_SLUG })
    }).catch(() => {});

    for (const fw of FRAMEWORKS) {
      console.log(`[E2E:FW] Testing framework: ${fw}`);

      // Evidence GET
      const evUrl = `${ORIGIN}/api/evidence?frameworkId=${encodeURIComponent(fw)}&workspace=${encodeURIComponent(WORKSPACE_SLUG)}`;
      const evRes = await fetch(evUrl, { headers: { Authorization: `Bearer ${token}`, 'x-workspace-slug': WORKSPACE_SLUG, 'x-e2e': '1' } });
      const evJson = await evRes.json().catch(() => null);
      if (!evRes.ok) {
        console.error('[E2E:FW] Evidence GET failed', fw, evRes.status, evJson);
        process.exit(1);
      }
      console.log(`[E2E:FW] Evidence GET ok, count=${Array.isArray(evJson?.data) ? evJson.data.length : 'n/a'}`);

      // Monitoring GET
      const monUrl = `${ORIGIN}/api/monitoring?frameworkId=${encodeURIComponent(fw)}&workspace=${encodeURIComponent(WORKSPACE_SLUG)}`;
      const monRes = await fetch(monUrl, { headers: { Authorization: `Bearer ${token}`, 'x-workspace-slug': WORKSPACE_SLUG, 'x-e2e': '1' } });
      const monJson = await monRes.json().catch(() => null);
      if (!monRes.ok) {
        console.error('[E2E:FW] Monitoring GET failed', fw, monRes.status, monJson);
        process.exit(1);
      }
      console.log(`[E2E:FW] Monitoring GET ok`);
    }

    console.log('[E2E:FW] SUCCESS');
    process.exit(0);
  } catch (err) {
    console.error('[E2E:FW] FAILED', err);
    process.exit(1);
  }
})();
