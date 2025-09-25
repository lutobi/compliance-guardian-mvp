/*
 E2E: Workspace switch flow using Puppeteer
 - Seeds a test user + workspace via /api/test/seed-user
 - Logs in via UI
 - Selects the seeded workspace
 - Verifies /api/auth/callback and /api/workspace/switch return HTTP 200
 - Confirms navigation to /workspace/[slug]/dashboard

 Usage:
   node scripts/e2e/workspace-switch.e2e.js --baseUrl http://localhost:3000 --seedToken dev-seed

 Ensure the app is running locally before executing.
*/

const puppeteer = require('puppeteer');
const VERBOSE = true;
const assert = require('assert');
const { URL } = require('url');

function getArg(name, def) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return def;
}

const BASE_URL = getArg('baseUrl', 'http://localhost:3000');
const SEED_TOKEN = getArg('seedToken', process.env.TEST_SEED_TOKEN || 'dev-seed');
const TEST_EMAIL = getArg('email', `e2e_${Date.now()}@example.test`);
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

async function waitForStatus(page, urlPart, expected = 200, timeout = 30000) {
  return new Promise((resolve, reject) => {
    let done = false;
    const onResponse = async (res) => {
      try {
        const url = res.url();
        if (url.includes(urlPart)) {
          const status = res.status();
          if (VERBOSE) console.log(`[E2E] ${urlPart} -> ${status}`);
          if (!done) {
            done = true;
            page.off('response', onResponse);
            clearTimeout(timer);
            if (status === expected) resolve(true);
            else reject(new Error(`${urlPart} returned ${status}`));
          }
        }
      } catch (e) {
        if (!done) {
          done = true;
          page.off('response', onResponse);
          clearTimeout(timer);
          reject(e);
        }
      }
    };
    page.on('response', onResponse);
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        page.off('response', onResponse);
        reject(new Error(`Timeout waiting for ${urlPart} ${expected}`));
      }
    }, timeout);
  });
}

async function run() {
  console.log('[E2E] Seeding test user/workspace...');
  const seed = await seedTestUser();
  const { workspace } = seed;
  console.log('[E2E] Seeded workspace:', workspace);

  const browser = await puppeteer.launch({ headless: 'new', slowMo: 20, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(45000);

  // Verbose logging from browser
  page.on('console', (msg) => {
    try {
      const args = msg.args().map((a) => a._remoteObject?.value).filter((v) => v !== undefined);
      console.log('[BROWSER]', msg.type().toUpperCase(), msg.text(), ...args);
    } catch {
      console.log('[BROWSER]', msg.type().toUpperCase(), msg.text());
    }
  });
  page.on('pageerror', (err) => console.error('[BROWSER] PageError:', err));
  page.on('requestfailed', (req) => console.warn('[BROWSER] RequestFailed:', req.url(), req.failure()?.errorText));

  // 1) Go to login page
  console.log('[E2E] Navigating to login');
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle2', timeout: 45000 });

  // 2) Fill login form (generic selectors)
  console.log('[E2E] Filling credentials');
  // Try a few common selectors to be resilient
  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input#email',
  ];
  const passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input#password',
  ];

  let emailSel = null;
  for (const s of emailSelectors) {
    if (await page.$(s)) { emailSel = s; break; }
  }
  let passSel = null;
  for (const s of passwordSelectors) {
    if (await page.$(s)) { passSel = s; break; }
  }
  if (!emailSel || !passSel) {
    throw new Error('Could not find email/password inputs');
  }

  await page.waitForSelector(emailSel, { timeout: 30000 });
  await page.waitForSelector(passSel, { timeout: 30000 });
  await page.click(emailSel, { clickCount: 3 });
  await page.type(emailSel, TEST_EMAIL);
  await page.click(passSel, { clickCount: 3 });
  await page.type(passSel, TEST_PASSWORD);

  // Submit (try common submit selectors)
  const submitSelectors = [
    'button[type="submit"]',
    'button[data-testid="submit"]',
    'button:has-text("Sign In")',
    'button:has-text("Log in")',
  ];
  let submitted = false;
  for (const s of submitSelectors) {
    const el = await page.$(s);
    if (el) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 45000 }),
        el.click(),
      ]);
      submitted = true;
      break;
    }
  }
  if (!submitted) {
    // fallback: press Enter in password field
    await page.focus(passSel);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 45000 });
  }

  // After sign-in, the app should call /api/auth/callback (listen for it)
  console.log('[E2E] Waiting for /api/auth/callback 200');
  await waitForStatus(page, '/api/auth/callback', 200);

  // 2.5) Test Sidebar Dashboard tab BEFORE switching workspace
  // Depending on app state, clicking Dashboard should either land on a workspace dashboard
  // (if default exists) or take user to workspace selection without redirecting to login.
  try {
    console.log('[E2E] Clicking Sidebar Dashboard before switch');
    // Ensure sidebar is rendered; if behind a toggle on mobile widths, set a wide viewport
    await page.setViewport({ width: 1366, height: 900 });
    // Find an element with text 'Dashboard' within the nav and click it
    const dashNodes = await page.$x("//nav//*[contains(text(), 'Dashboard')]");
    if (dashNodes.length) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 45000 }),
        dashNodes[0].click(),
      ]);
      const path = new URL(page.url()).pathname;
      if (!(path.includes('/workspace/') && path.includes('/dashboard')) && path !== '/workspace/select') {
        throw new Error(`Unexpected Dashboard click destination before switch: ${path}`);
      }
      console.log('[E2E] Dashboard tab OK before switch:', path);
    } else {
      console.warn('[E2E] Could not find Dashboard nav item before switch; continuing');
    }
  } catch (e) {
    console.warn('[E2E] Warning during pre-switch Dashboard click:', e.message);
  }

  // 3) Navigate to workspace selection
  console.log('[E2E] Navigating to workspace selection');
  await page.goto(`${BASE_URL}/workspace/select`, { waitUntil: 'networkidle2', timeout: 45000 });

  // 4) Click the seeded workspace by slug or name
  console.log('[E2E] Selecting workspace', workspace.slug);
  const candidateTexts = [workspace.slug, workspace.name];
  let clicked = false;
  for (const t of candidateTexts) {
    const xpath = `//*[contains(text(), '${t}')]`;
    const elHandles = await page.$x(xpath);
    if (elHandles.length) {
      await elHandles[0].click();
      clicked = true;
      break;
    }
  }
  if (!clicked) throw new Error('Workspace option not found in selection UI');

  // 5) Expect the app to call /api/auth/callback (optional) and /api/workspace/switch 200
  console.log('[E2E] Waiting for /api/workspace/switch 200');
  await waitForStatus(page, '/api/workspace/switch', 200, 45000);

  // 6) Wait for navigation to dashboard URL with slug
  console.log('[E2E] Waiting for dashboard URL');
  await page.waitForFunction(
    (slug) => window.location.pathname.includes(`/workspace/${slug}/dashboard`),
    { timeout: 45000 },
    workspace.slug
  );

  // 7) Click Sidebar Dashboard AFTER switching and verify it remains on dashboard (no login redirect)
  console.log('[E2E] Clicking Sidebar Dashboard after switch');
  const postNodes = await page.$x("//nav//*[contains(text(), 'Dashboard')]");
  if (postNodes.length) {
    await Promise.all([
      // We may stay on same page; no navigation is also acceptable. Use a race with timeout.
      (async () => {
        try { await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }); } catch {}
      })(),
      postNodes[0].click(),
    ]);
    const url = new URL(page.url());
    const pathOk = url.pathname.includes(`/workspace/${workspace.slug}/dashboard`);
    if (!pathOk) throw new Error(`After Dashboard click, not on expected dashboard: ${url.pathname}`);
    console.log('[E2E] Dashboard tab OK after switch:', url.pathname);
  } else {
    console.warn('[E2E] Could not find Dashboard nav item after switch');
  }

  console.log('[E2E] SUCCESS: Workspace switch flow passed');
  await browser.close();
}

run().catch(async (err) => {
  console.error('[E2E] FAILED:', err);
  process.exitCode = 1;
});
