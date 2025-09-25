#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function testOnboardingFlow() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
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

    // Create user profile with onboarding_completed = false
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        email,
        name: 'Test User',
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) throw profileError;
    console.log('✅ Created user profile');

    // Test login flow
    await page.goto('http://localhost:3009/auth/login');
    console.log('📍 Navigated to login page');
    
    // Set required environment variables
    await page.evaluate((url) => {
      window.localStorage.setItem('supabase.url', url);
      window.localStorage.setItem('supabase.key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTE3OTgsImV4cCI6MjA2MjY2Nzc5OH0.aPQx_MYNjsFfBIZVAeN9yTqLkxHZVMkRPLxp-T7zYqU');
    }, supabaseUrl);

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', password);
    await page.click('button[type="submit"]');
    console.log('📍 Submitted login form');
    
    // Wait for redirect to either /dashboard or /onboarding
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    const currentUrl = page.url();
    
    // If redirected to dashboard, navigate to onboarding manually
    if (currentUrl.includes('/dashboard')) {
      await page.goto('http://localhost:3009/onboarding');
      console.log('📍 Manually navigated to onboarding');
    } else if (!currentUrl.includes('/onboarding')) {
      throw new Error(`Unexpected redirect to ${currentUrl}`);
    }
    console.log('✅ Navigation successful');

    // Wait for onboarding page to load
    await page.waitForSelector('.container', { timeout: 10000 });
    console.log('✅ Onboarding page loaded');

    // Step 1: Welcome - Select "Create New Workspace"
    await page.waitForSelector('.cursor-pointer', { timeout: 10000 });
    const createWorkspaceCard = await page.$('.cursor-pointer');
    await createWorkspaceCard.click();
    console.log('✅ Selected Create New Workspace');

    // Wait for button to be enabled
    await page.waitForSelector('button:not([disabled])', { timeout: 10000 });
    await page.click('button:not([disabled])');
    console.log('✅ Clicked continue after workspace selection');

    // Step 2: Workspace Setup - Wait for form to load
    await page.waitForSelector('#workspaceName', { timeout: 10000 });
    await page.type('#workspaceName', 'Test Workspace');
    await page.type('#workspaceSlug', 'test-workspace');
    
    // Select industry and company size
    await page.select('#industry', 'technology');
    await page.select('#companySize', '1-10');
    
    // Get the session token
    const { data: { session } } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!session?.access_token) {
      throw new Error('Failed to get session token');
    }

    // Set the auth token in the browser
    await page.evaluate((token) => {
      localStorage.setItem('sb-access-token', token);
      localStorage.setItem('mt_session', token);
    }, session.access_token);

    // Click Create Workspace and wait for API call to complete
    await Promise.all([
      page.waitForResponse(
        response => response.url().includes('/api/team/init'),
        { timeout: 10000 }
      ),
      page.click('button.flex-1:not([variant="outline"])')
    ]);
    console.log('✅ Submitted workspace form');

    // Wait for next step to load
    await page.waitForSelector('#profileName', { timeout: 10000 });
    console.log('✅ Profile step loaded');

    // Step 3: Profile Setup
    await page.type('#profileName', 'Test User');
    await page.select('#timezone', 'UTC');
    await page.click('button.flex-1:not([variant="outline"])');
    console.log('✅ Submitted profile form');

    // Step 4: Completion
    await page.waitForSelector('button.w-full', { timeout: 10000 });
    await page.click('button.w-full'); // Click Go to Dashboard
    console.log('✅ Clicked finish');

    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
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

    // Verify onboarding completed
    const { data: profile, error: getProfileError } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    if (getProfileError) throw getProfileError;
    if (!profile.onboarding_completed) {
      throw new Error('Onboarding not marked as completed');
    }
    console.log('✅ Onboarding marked as completed');

    // Test session persistence
    await page.goto(dashboardUrl + '/settings');
    await page.waitForSelector('[data-testid="workspace-name"]', { timeout: 10000 });
    console.log('✅ Session persisted across navigation');

    console.log('✅ All onboarding tests passed!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.error('Screenshot saved to error-screenshot.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testOnboardingFlow();
