#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function testOnboardingFlow() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Create test user
    const email = `test-${Date.now()}@example.com`;
    const password = 'testpass123';
    
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (createError) throw createError;
    console.log('✅ Created test user:', user.id);

    // Test login flow
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to onboarding
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const currentUrl = page.url();
    if (!currentUrl.includes('/onboarding')) {
      throw new Error(`Expected redirect to onboarding, got ${currentUrl}`);
    }
    console.log('✅ Login and redirect successful');

    // Fill onboarding form
    await page.waitForSelector('input[name="workspaceName"]');
    await page.type('input[name="workspaceName"]', 'Test Workspace');
    await page.type('input[name="industry"]', 'Technology');
    await page.select('select[name="companySize"]', '1-10');
    await page.click('button[type="submit"]');

    // Wait for workspace creation and redirect
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const dashboardUrl = page.url();
    if (!dashboardUrl.includes('/dashboard')) {
      throw new Error(`Expected redirect to dashboard, got ${dashboardUrl}`);
    }
    console.log('✅ Workspace creation and redirect successful');

    // Verify workspace data
    const { data: workspace, error: getWorkspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (getWorkspaceError) throw getWorkspaceError;
    console.log('✅ Workspace created:', workspace);

    // Test session persistence
    await page.goto(dashboardUrl + '/settings');
    await page.waitForSelector('[data-testid="workspace-name"]');
    console.log('✅ Session persisted across navigation');

    console.log('✅ All onboarding tests passed!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testOnboardingFlow();
