/*
 E2E: Monitoring API sanity (auth + workspace + create/update)

 Usage:
   TEST_EMAIL="you@example.com" TEST_PASSWORD="yourpass" node scripts/e2e/monitoring.e2e.js

 Requires dev server running at http://localhost:3002
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
const FRAMEWORK_ID = process.env.TEST_FRAMEWORK_ID || '84fe5672-eb4b-405c-a913-19f956fbe256';

if (!EMAIL || !PASSWORD) {
  console.error('[E2E] Missing TEST_EMAIL or TEST_PASSWORD env vars');
  process.exit(1);
}

(async () => {
  try {
    console.log('[E2E:MON] Seeding test user and workspace');
    try {
      const res = await fetch(`${ORIGIN}/api/test/seed-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-seed-token': 'dev-seed' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        console.warn('[E2E:MON] Seed failed (continuing):', res.status, json);
      } else if (json?.workspace?.slug) {
        WORKSPACE_SLUG = json.workspace.slug;
        console.log('[E2E:MON] Seeded workspace:', WORKSPACE_SLUG);
      }
    } catch (e) {
      console.warn('[E2E:MON] Seed error (continuing):', e?.message || e);
    }

    console.log('[E2E:MON] Signing in (programmatic)');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
    if (signInErr || !signInData?.session?.access_token) throw new Error('Failed to sign in');
    const token = signInData.session.access_token;

    console.log('[E2E:MON] whoami');
    const who = await fetch(`${ORIGIN}/api/dev/whoami`, { headers: { Authorization: `Bearer ${token}`, 'x-e2e': '1' } });
    if (!who.ok) throw new Error('whoami failed');

    console.log('[E2E:MON] switch workspace', WORKSPACE_SLUG);
    const sw = await fetch(`${ORIGIN}/api/workspace/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-e2e': '1' },
      body: JSON.stringify({ workspaceSlug: WORKSPACE_SLUG })
    });
    if (!sw.ok) console.warn('[E2E:MON] switch workspace failed (continuing)', sw.status);

    // GET monitoring
    console.log('[E2E:MON] GET /api/monitoring');
    const getUrl = `${ORIGIN}/api/monitoring?frameworkId=${encodeURIComponent(FRAMEWORK_ID)}&workspace=${encodeURIComponent(WORKSPACE_SLUG)}`;
    const getRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${token}`, 'x-workspace-slug': WORKSPACE_SLUG, 'x-e2e': '1' } });
    const getJson = await getRes.json().catch(() => null);
    if (!getRes.ok) {
      console.error('[E2E:MON] GET failed', getRes.status, getJson);
      process.exit(1);
    }
    console.log('[E2E:MON] GET ok, monitoring:', getJson?.data?.monitoring ? 'exists' : 'null');

    // POST monitoring
    console.log('[E2E:MON] POST /api/monitoring');
    const settings = { enabled: true, frequency: 'weekly', thresholds: { risk: 'medium' } };
    const postRes = await fetch(`${ORIGIN}/api/monitoring?workspace=${encodeURIComponent(WORKSPACE_SLUG)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-workspace-slug': WORKSPACE_SLUG, 'x-e2e': '1' },
      body: JSON.stringify({ frameworkId: FRAMEWORK_ID, settings })
    });
    const postJson = await postRes.json().catch(() => null);
    if (!postRes.ok) {
      console.error('[E2E:MON] POST failed', postRes.status, postJson);
      process.exit(1);
    }
    console.log('[E2E:MON] POST ok');

    console.log('[E2E:MON] SUCCESS');
    process.exit(0);
  } catch (err) {
    console.error('[E2E:MON] FAILED', err);
    process.exit(1);
  }
})();
