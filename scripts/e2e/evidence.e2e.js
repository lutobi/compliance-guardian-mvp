/*
 E2E: Auth -> Workspace Switch -> Evidence API sanity

 Usage:
   TEST_EMAIL="you@example.com" TEST_PASSWORD="yourpass" node scripts/e2e/evidence.e2e.js

 Requires dev server running at http://localhost:3002
*/

const { createClient } = require('@supabase/supabase-js');
// Load env for local runs
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
  dotenv.config();
} catch {}

function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

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
    console.log('[E2E] Seeding test user and workspace (server-side)');
    try {
      const res = await fetch(`${ORIGIN}/api/test/seed-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-seed-token': 'dev-seed' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        console.warn('[E2E] Seed endpoint failed (continuing):', res.status, json);
      } else if (json?.workspace?.slug) {
        console.log('[E2E] Seeded workspace:', json.workspace.slug);
        WORKSPACE_SLUG = json.workspace.slug;
      }
    } catch (e) {
      console.warn('[E2E] Seed request threw (continuing):', e?.message || e);
    }

    // Sign in programmatically via Supabase to obtain access token
    console.log('[E2E] Signing in via Supabase (programmatic)');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
    if (signInErr || !signInData?.session?.access_token) {
      throw new Error('Failed to sign in and obtain access token');
    }
    const accessToken = signInData.session.access_token;
    console.log('[E2E] Access token acquired');

    // Call whoami dev endpoint to verify server sees the user
    const whoamiRes = await fetch(`${ORIGIN}/api/dev/whoami`, { headers: { Authorization: `Bearer ${accessToken}`, 'x-e2e': '1' } });
    const whoamiJson = await whoamiRes.json().catch(() => null);
    const whoami = { ok: whoamiRes.ok, json: whoamiJson };
    if (!whoami.ok) {
      console.error('[E2E] whoami failed', whoami.json);
      throw new Error('whoami failed');
    }
    console.log('[E2E] whoami ok');

    // Switch workspace via API
    console.log('[E2E] Switching workspace to', WORKSPACE_SLUG);
    const switchFetch = await fetch(`${ORIGIN}/api/workspace/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}`, 'x-e2e': '1' },
      body: JSON.stringify({ workspaceSlug: WORKSPACE_SLUG })
    });
    const switchJson = await switchFetch.json().catch(() => null);
    const switchRes = { ok: switchFetch.ok, status: switchFetch.status, json: switchJson };

    if (!switchRes.ok) {
      console.warn('[E2E] switch workspace failed (continuing)', switchRes.status, switchRes.json);
    } else {
      console.log('[E2E] Workspace switched');
    }

    // Validate GET /api/evidence works (200)
    console.log('[E2E] Testing GET /api/evidence');
    const getUrl = `${ORIGIN}/api/evidence?frameworkId=${encodeURIComponent(FRAMEWORK_ID)}&workspace=${encodeURIComponent(WORKSPACE_SLUG)}`;
    const getRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${accessToken}`, 'x-workspace-slug': WORKSPACE_SLUG, 'x-e2e': '1' } });
    const getJson = await getRes.json().catch(() => null);
    const getEvidence = { ok: getRes.ok, status: getRes.status, json: getJson };

    if (!getEvidence.ok) {
      console.error('[E2E] GET /api/evidence failed', getEvidence.status, getEvidence.json);
      throw new Error('GET /api/evidence failed');
    }
    console.log('[E2E] GET /api/evidence ok, items:', Array.isArray(getEvidence.json?.data) ? getEvidence.json.data.length : 'n/a');

    // Create a test evidence via API
    console.log('[E2E] Testing POST /api/evidence');
    const uniqueNote = `e2e-note-${Date.now()}`;
    const postPayload = {
      subcontrolId: 'e2e-subcontrol',
      controlId: 'e2e-control',
      frameworkId: FRAMEWORK_ID,
      notes: uniqueNote,
      files: [],
      controlName: 'E2E Control'
    };
    const postRes = await fetch(`${ORIGIN}/api/evidence?workspace=${encodeURIComponent(WORKSPACE_SLUG)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}`, 'x-workspace-slug': WORKSPACE_SLUG, 'x-e2e': '1' },
      body: JSON.stringify(postPayload)
    });
    const postJson = await postRes.json().catch(() => null);
    const postEvidence = { ok: postRes.ok, status: postRes.status, json: postJson };

    if (!postEvidence.ok) {
      console.error('[E2E] POST /api/evidence failed', postEvidence.status, postEvidence.json);
      throw new Error('POST /api/evidence failed');
    }
    const created = postEvidence.json?.data;
    console.log('[E2E] Evidence created id=', created?.id);

    // Clean up: delete evidence
    if (created?.id) {
      console.log('[E2E] Deleting test evidence');
      const delFetch = await fetch(`${ORIGIN}/api/evidence?workspace=${encodeURIComponent(WORKSPACE_SLUG)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}`, 'x-workspace-slug': WORKSPACE_SLUG, 'x-e2e': '1' },
        body: JSON.stringify({ id: created.id })
      });
      const delJson = await delFetch.json().catch(() => null);
      const delRes = { ok: delFetch.ok, status: delFetch.status, json: delJson };

      if (!delRes.ok || delRes.json?.success === false) {
        console.warn('[E2E] DELETE /api/evidence failed', delRes.status, delRes.json);
      } else {
        console.log('[E2E] Evidence deleted');
      }
    }

    console.log('[E2E] SUCCESS');
    process.exit(0);
  } catch (err) {
    console.error('[E2E] FAILED', err);
    process.exit(1);
  }
})();
